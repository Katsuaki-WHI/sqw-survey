import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AI_REPORT_SYSTEM_PROMPT, PERSONAL_REPORT_PROMPT_JA, PERSONAL_REPORT_PROMPT_EN } from "@/lib/ai/whi-philosophy";
import { HTML_OUTPUT_INSTRUCTIONS_JA, HTML_OUTPUT_INSTRUCTIONS_EN } from "@/lib/ai/html-template";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Test mode
  if (body.test) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ report: "AIレポート機能は現在準備中です。ANTHROPIC_API_KEYを設定してください。" });
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: AI_REPORT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: "テストデータで短い個人レポートサンプルを200文字で生成してください。スコアは全カテゴリ3.5と仮定。" }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text : "";
      return NextResponse.json({ report: text, generatedAt: new Date().toISOString() });
    } catch (e) {
      return NextResponse.json({ report: `テスト生成エラー: ${e}` });
    }
  }

  const { teamId, memberToken, language } = body;
  if (!teamId || !memberToken) {
    return NextResponse.json({ error: "Missing teamId or memberToken" }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AIレポート機能は現在準備中です" }, { status: 503 });
  }

  const supabase = await createSupabaseServer();

  // Get member data
  const { data: member } = await supabase
    .from("team_members")
    .select("session_id, role, respondent_name")
    .eq("member_token", memberToken)
    .single();

  if (!member?.session_id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Get qualitative responses
  const { data: qualitativeData } = await supabase
    .from("qualitative_responses")
    .select("question_text, answer")
    .eq("member_id", member.session_id)
    .limit(10);

  // Get management trust score from session
  const { data: sessionData } = await supabase
    .from("survey_sessions")
    .select("category_scores")
    .eq("id", member.session_id)
    .single();
  const managementScores = (sessionData?.category_scores as Record<string, { avg: number }> | null)?.management;

  // Get member's answers
  const { data: answers } = await supabase
    .from("survey_answers")
    .select("question_id, score")
    .eq("session_id", member.session_id)
    .not("score", "is", null);

  const memberScores: Record<string, number[]> = {};
  for (const a of answers || []) {
    for (const [cat, config] of Object.entries(CATEGORY_CONFIG)) {
      if (config.questionIds.includes(a.question_id)) {
        if (!memberScores[cat]) memberScores[cat] = [];
        memberScores[cat].push(a.score);
      }
    }
  }
  const memberCatAvg: Record<string, number> = {};
  for (const [cat, scores] of Object.entries(memberScores)) {
    memberCatAvg[cat] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }

  // Get team info
  const { data: team } = await supabase
    .from("teams")
    .select("name, industry, company_size, survey_version")
    .eq("id", teamId)
    .single();

  // Get team averages
  const { data: sessions } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("team_id", teamId)
    .not("completed_at", "is", null);

  const sessionIds = (sessions || []).map((s) => s.id);
  const { data: teamAnswers } = await supabase
    .from("survey_answers")
    .select("question_id, score")
    .in("session_id", sessionIds)
    .not("score", "is", null);

  const teamScores: Record<string, number[]> = {};
  for (const a of teamAnswers || []) {
    for (const [cat, config] of Object.entries(CATEGORY_CONFIG)) {
      if (config.questionIds.includes(a.question_id)) {
        if (!teamScores[cat]) teamScores[cat] = [];
        teamScores[cat].push(a.score);
      }
    }
  }
  const teamAvg: Record<string, number> = {};
  for (const [cat, scores] of Object.entries(teamScores)) {
    teamAvg[cat] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }

  // Find gap categories (diff >= 0.5)
  const gapCategories: string[] = [];
  for (const cat of Object.keys(memberCatAvg)) {
    if (teamAvg[cat] && Math.abs(memberCatAvg[cat] - teamAvg[cat]) >= 0.5) {
      gapCategories.push(`${CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}: 個人${memberCatAvg[cat]} vs チーム${teamAvg[cat]}`);
    }
  }

  const isEn = language === "en";
  const htmlInstructions = isEn ? HTML_OUTPUT_INSTRUCTIONS_EN : HTML_OUTPUT_INSTRUCTIONS_JA;
  const basePrompt = isEn ? PERSONAL_REPORT_PROMPT_EN : PERSONAL_REPORT_PROMPT_JA;
  const systemPrompt = basePrompt + htmlInstructions;

  const name = member.respondent_name || (isEn ? "you" : "あなた");

  // Engagement coordinate type
  const q26 = memberCatAvg.happiness ?? 3;
  const q02 = memberCatAvg.landscape ?? 3;
  let engagementType = "unknown";
  if (q26 >= 3.5 && q02 >= 3.5) engagementType = isEn ? "Engaged" : "エンゲージ型";
  else if (q26 < 3.5 && q02 >= 3.5) engagementType = isEn ? "Vision-Driven" : "理念先行型";
  else if (q26 >= 3.5 && q02 < 3.5) engagementType = isEn ? "Action-Driven" : "実行先行型";
  else engagementType = isEn ? "At-Risk" : "離脱リスク型";
  const catScoresStr = Object.entries(memberCatAvg)
    .map(([cat, avg]) => `  ${CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}: ${avg}`)
    .join("\n");
  const teamAvgStr = Object.entries(teamAvg)
    .map(([cat, avg]) => `  ${CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}: ${avg}`)
    .join("\n");

  // Get individual Q scores for engagement analysis
  const individualScores = answers?.reduce((acc, a) => { acc[a.question_id] = a.score; return acc; }, {} as Record<number, number>) || {};
  const q26Score = individualScores[26] ?? 0;
  const q02Score = individualScores[2] ?? 0;

  const userMessage = isEn
    ? `Generate a personal AI report based on the following data.

Respondent: ${name}
Team: ${team?.name || "Unknown"}
Role: ${member.role || "not specified"}
Industry: ${team?.industry || "not specified"}
Company size: ${team?.company_size || "not specified"}

Personal scores (by category):
${catScoresStr}

Team average scores (by category):
${teamAvgStr}

Key engagement scores:
- Q26 (Happiness): ${q26Score}
- Q02 (Mission/Vision pride): ${q02Score}
- Engagement coordinate type: ${engagementType}

Categories with significant perception gaps (diff >= 0.5):
${gapCategories.length > 0 ? gapCategories.join("\n") : "None"}
${qualitativeData && qualitativeData.length > 0 ? `
[Qualitative Comments]
${qualitativeData.map((q) => `Q: ${q.question_text}\nA: ${q.answer}`).join("\n\n")}
Note: Naturally incorporate qualitative responses into insights. The first question about current work/concerns should be especially reflected in Section 2.` : ""}
${managementScores ? `
[Management Trust Score] Average: ${managementScores.avg?.toFixed(2) ?? "N/A"}
Note: If there is a gap between management and team scores, mention it in Section 3.` : ""}

Write the report in English using HTML formatting.`
    : `以下のデータをもとに個人AIレポートを生成してください。

回答者情報：
- 名前：${name}
- チーム名：${team?.name || "不明"}
- 立場：${member.role || "未指定"}
- 業種：${team?.industry || "未指定"}
- 企業規模：${team?.company_size || "未指定"}

個人スコア（カテゴリ別）：
${catScoresStr}

チーム平均スコア（カテゴリ別）：
${teamAvgStr}

エンゲージメント関連スコア：
- Q26（幸福度）：${q26Score}
- Q02（ミッション・ビジョンへの誇り）：${q02Score}
- エンゲージメント座標タイプ：${engagementType}

認識ギャップが大きいカテゴリ（差が0.5以上）：
${gapCategories.length > 0 ? gapCategories.join("\n") : "なし"}
${qualitativeData && qualitativeData.length > 0 ? `
【定性コメント（自由記述）】
${qualitativeData.map((q) => `Q: ${q.question_text}\nA: ${q.answer}`).join("\n\n")}
※定性コメントがある場合は、レポートの示唆に自然に反映してください。特に最初の質問（現在の仕事・悩み）への回答は、セクション2の「気づきのタネ」で重点的に活用してください。` : ""}
${managementScores ? `
【経営への信頼スコア】平均: ${managementScores.avg?.toFixed(2) ?? "N/A"}
※経営スコアとチームスコアのギャップがある場合は、セクション3で言及してください。` : ""}

HTML形式で日本語のレポートを作成してください。`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const rawReport = msg.content[0].type === "text" ? msg.content[0].text : "";
    let report = rawReport
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // If output was truncated, close open HTML tags
    if (msg.stop_reason === "max_tokens") {
      report += "</div></div></div>";
    }

    // Save to cache (non-blocking)
    supabase.from("ai_report_cache").insert({
      team_id: teamId,
      member_token: memberToken,
      report_type: "personal",
      language: language || "ja",
      content: report,
    }).then(() => {});

    return NextResponse.json({ report, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("[ai-report/personal] Error:", e);
    return NextResponse.json({
      error: isEn
        ? "Failed to generate report. Please try again later."
        : "レポートの生成に失敗しました。しばらく経ってから再度お試しください。",
    }, { status: 500 });
  }
}
