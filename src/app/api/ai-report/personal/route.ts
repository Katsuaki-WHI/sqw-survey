import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AI_REPORT_SYSTEM_PROMPT } from "@/lib/ai/whi-philosophy";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Test mode
  if (body.test) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ message: "ANTHROPIC_API_KEY not configured" });
    }
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: AI_REPORT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: "テストデータで短い個人レポートサンプルを100文字で生成してください。" }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ report: text });
  }

  const { teamId, memberToken, language } = body;
  if (!teamId || !memberToken) {
    return NextResponse.json({ error: "Missing teamId or memberToken" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Get member data
  const { data: member } = await supabase
    .from("team_members")
    .select("session_id, role")
    .eq("member_token", memberToken)
    .single();

  if (!member?.session_id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

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
  const memberCategoryScores: Record<string, number> = {};
  for (const [cat, scores] of Object.entries(memberScores)) {
    memberCategoryScores[cat] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }

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
  const teamAverage: Record<string, number> = {};
  for (const [cat, scores] of Object.entries(teamScores)) {
    teamAverage[cat] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }

  // Get team name
  const { data: team } = await supabase.from("teams").select("name").eq("id", teamId).single();

  // Get prompt from DB or fallback
  let systemPrompt = AI_REPORT_SYSTEM_PROMPT;
  const { data: promptRow } = await supabase
    .from("ai_prompts")
    .select("content")
    .eq("type", "personal")
    .eq("language", language || "ja")
    .eq("is_active", true)
    .single();
  if (promptRow?.content) systemPrompt = promptRow.content;

  const isEn = language === "en";
  const userMessage = isEn
    ? `Generate a personal survey report for this team member.\n\nTeam: ${team?.name}\nRole: ${member.role || "not specified"}\nResponse count: ${sessionIds.length}\n\nMember scores by category:\n${JSON.stringify(memberCategoryScores, null, 2)}\n\nTeam average by category:\n${JSON.stringify(teamAverage, null, 2)}\n\nWrite the report in English.`
    : `このチームメンバーの個人サーベイレポートを生成してください。\n\nチーム名: ${team?.name}\n立場: ${member.role || "未指定"}\n回答者数: ${sessionIds.length}名\n\n個人スコア（カテゴリ別）:\n${JSON.stringify(memberCategoryScores, null, 2)}\n\nチーム平均（カテゴリ別）:\n${JSON.stringify(teamAverage, null, 2)}\n\n日本語でレポートを作成してください。`;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const report = msg.content[0].type === "text" ? msg.content[0].text : "";
  return NextResponse.json({ report });
}
