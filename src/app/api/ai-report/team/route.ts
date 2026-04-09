import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AI_REPORT_SYSTEM_PROMPT, TEAM_REPORT_PROMPT_JA, TEAM_REPORT_PROMPT_EN } from "@/lib/ai/whi-philosophy";
import { HTML_OUTPUT_INSTRUCTIONS_JA, HTML_OUTPUT_INSTRUCTIONS_EN } from "@/lib/ai/html-template";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";

export async function POST(request: NextRequest) {
  const { teamId, adminToken, language } = await request.json();

  if (!adminToken && !teamId) {
    return NextResponse.json({ error: "Missing adminToken or teamId" }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AIレポート機能は現在準備中です" }, { status: 503 });
  }

  const supabase = await createSupabaseServer();

  let team: { id: string; name: string; industry: string | null; company_size: string | null } | null = null;

  if (adminToken && adminToken !== "__member_request__") {
    const { data } = await supabase
      .from("teams")
      .select("id, name, industry, company_size")
      .eq("admin_token", adminToken)
      .single();
    team = data;
  } else if (teamId) {
    const { data } = await supabase
      .from("teams")
      .select("id, name, industry, company_size")
      .eq("id", teamId)
      .single();
    team = data;
  }

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const resolvedTeamId = team.id;

  const { data: sessions } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("team_id", resolvedTeamId)
    .not("completed_at", "is", null);

  const sessionIds = (sessions || []).map((s) => s.id);
  if (sessionIds.length === 0) {
    return NextResponse.json({ error: "No responses" }, { status: 400 });
  }

  // Get qualitative responses for all team members
  const { data: qualitativeData } = await supabase
    .from("qualitative_responses")
    .select("question_text, answer")
    .in("session_id", sessionIds)
    .limit(50);

  // Get management trust scores
  const { data: managementSessions } = await supabase
    .from("survey_sessions")
    .select("category_scores")
    .in("id", sessionIds)
    .not("completed_at", "is", null);

  const managementScores: number[] = [];
  for (const s of managementSessions || []) {
    const scores = s.category_scores as Record<string, { avg: number }> | null;
    if (scores?.management?.avg) managementScores.push(scores.management.avg);
  }
  const managementAvg = managementScores.length > 0
    ? Math.round((managementScores.reduce((a, b) => a + b, 0) / managementScores.length) * 100) / 100
    : null;

  const { data: allAnswers } = await supabase
    .from("survey_answers")
    .select("question_id, score")
    .in("session_id", sessionIds)
    .not("score", "is", null);

  // Calculate per-category stats
  const categoryStats: Record<string, { avg: number; min: number; max: number; sd: number }> = {};
  let overallSum = 0;
  let overallCount = 0;

  for (const [cat, config] of Object.entries(CATEGORY_CONFIG)) {
    const scores: number[] = [];
    for (const a of allAnswers || []) {
      if (config.questionIds.includes(a.question_id)) {
        scores.push(a.score);
      }
    }
    if (scores.length === 0) continue;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length;
    categoryStats[cat] = {
      avg: Math.round(avg * 100) / 100,
      min: Math.min(...scores),
      max: Math.max(...scores),
      sd: Math.round(Math.sqrt(variance) * 100) / 100,
    };
    if (cat !== "management") {
      overallSum += scores.reduce((a, b) => a + b, 0);
      overallCount += scores.length;
    }
  }

  const overallAverage = overallCount > 0 ? Math.round((overallSum / overallCount) * 100) / 100 : 0;

  // High variance categories
  const highVariance = Object.entries(categoryStats)
    .filter(([cat]) => cat !== "management")
    .sort((a, b) => b[1].sd - a[1].sd)
    .slice(0, 3)
    .map(([cat, s]) => `${CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}: SD=${s.sd}, avg=${s.avg}`);

  // Get Q26 scores for at-risk detection
  const q26Scores: number[] = [];
  for (const a of allAnswers || []) {
    if (a.question_id === 26) q26Scores.push(a.score);
  }
  const q26Min = q26Scores.length > 0 ? Math.min(...q26Scores) : 0;
  const q26AllAbove3 = q26Scores.every((s) => s >= 3.0);

  const isEn = language === "en";
  const htmlInstructions = isEn ? HTML_OUTPUT_INSTRUCTIONS_EN : HTML_OUTPUT_INSTRUCTIONS_JA;
  const basePrompt = isEn ? TEAM_REPORT_PROMPT_EN : TEAM_REPORT_PROMPT_JA;
  const systemPrompt = basePrompt + htmlInstructions;
  const statsStr = Object.entries(categoryStats)
    .map(([cat, s]) => `  ${CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}: avg=${s.avg}, min=${s.min}, max=${s.max}, SD=${s.sd}`)
    .join("\n");

  const userMessage = isEn
    ? `Generate a team AI report based on the following data.

Team: ${team.name}
Industry: ${team.industry || "not specified"}
Company size: ${team.company_size || "not specified"}
Response count: ${sessionIds.length}

Category statistics:
${statsStr}

Categories with highest perception gaps (highest SD):
${highVariance.join("\n")}

Overall team average: ${overallAverage}

Q26 (Happiness) analysis:
- Minimum Q26 score: ${q26Min}
- All members above 3.0: ${q26AllAbove3 ? "Yes" : "No"}
- Number of Q26 responses: ${q26Scores.length}

${qualitativeData && qualitativeData.length > 0 ? `
[Qualitative Comments (All Team Members)]
${qualitativeData.map((q) => `Q: ${q.question_text}\nA: ${q.answer}`).join("\n\n")}
Note: Incorporate qualitative responses as team-wide trends. Do NOT identify individual members.` : ""}
${managementAvg !== null ? `
[Management Trust Score] Team average: ${managementAvg}
Note: If there is a gap between management trust and overall team scores, mention it in the report.` : ""}

Write the report in English using HTML formatting.`
    : `以下のデータをもとにチームAIレポートを生成してください。

チーム情報：
- チーム名：${team.name}
- 業種：${team.industry || "未指定"}
- 企業規模：${team.company_size || "未指定"}
- 回答者数：${sessionIds.length}名

カテゴリ別統計：
${statsStr}

メンバー間の景色の違いが最も大きいカテゴリ（標準偏差が高い順）：
${highVariance.join("\n")}

チーム全体の平均スコア：${overallAverage}

Q26（幸福度）分析：
- Q26最低スコア：${q26Min}
- 全員3.0以上：${q26AllAbove3 ? "はい" : "いいえ"}
- Q26回答数：${q26Scores.length}名

${qualitativeData && qualitativeData.length > 0 ? `
【定性コメント（自由記述・チーム全員分）】
${qualitativeData.map((q) => `Q: ${q.question_text}\nA: ${q.answer}`).join("\n\n")}
※定性コメントは個人が特定されないよう抽象化し、チーム全体の傾向としてレポートに反映してください。` : ""}
${managementAvg !== null ? `
【経営への信頼スコア】チーム平均: ${managementAvg}
※経営スコアとチーム全体スコアにギャップがある場合は、レポート内で言及してください。` : ""}

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
      team_id: resolvedTeamId,
      report_type: "team",
      language: language || "ja",
      content: report,
    }).then(() => {});

    return NextResponse.json({ report, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("[ai-report/team] Error:", e);
    return NextResponse.json({
      error: isEn
        ? "Failed to generate report. Please try again later."
        : "レポートの生成に失敗しました。しばらく経ってから再度お試しください。",
    }, { status: 500 });
  }
}
