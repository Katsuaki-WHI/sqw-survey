import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AI_REPORT_SYSTEM_PROMPT } from "@/lib/ai/whi-philosophy";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export async function POST(request: NextRequest) {
  const { teamId, adminToken, language } = await request.json();

  if (!adminToken) {
    return NextResponse.json({ error: "Missing adminToken" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Verify admin token and get team
  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("admin_token", adminToken)
    .single();

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const resolvedTeamId = teamId || team.id;

  // Get all completed sessions
  const { data: sessions } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("team_id", resolvedTeamId)
    .not("completed_at", "is", null);

  const sessionIds = (sessions || []).map((s) => s.id);
  if (sessionIds.length === 0) {
    return NextResponse.json({ error: "No responses" }, { status: 400 });
  }

  // Get all answers
  const { data: allAnswers } = await supabase
    .from("survey_answers")
    .select("question_id, score, session_id")
    .in("session_id", sessionIds)
    .not("score", "is", null);

  // Calculate per-category stats
  const categoryStats: Record<string, { scores: number[]; avg: number; min: number; max: number; sd: number }> = {};

  for (const [cat, config] of Object.entries(CATEGORY_CONFIG)) {
    const scores: number[] = [];
    for (const a of allAnswers || []) {
      if (config.questionIds.includes(a.question_id)) {
        scores.push(a.score);
      }
    }
    if (scores.length === 0) continue;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const variance = scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length;
    categoryStats[cat] = {
      scores,
      avg: Math.round(avg * 100) / 100,
      min,
      max,
      sd: Math.round(Math.sqrt(variance) * 100) / 100,
    };
  }

  // Build stats summary
  const statsSummary: Record<string, { avg: number; min: number; max: number; sd: number }> = {};
  for (const [cat, stats] of Object.entries(categoryStats)) {
    statsSummary[cat] = { avg: stats.avg, min: stats.min, max: stats.max, sd: stats.sd };
  }

  // Get prompt
  let systemPrompt = AI_REPORT_SYSTEM_PROMPT;
  const { data: promptRow } = await supabase
    .from("ai_prompts")
    .select("content")
    .eq("type", "team")
    .eq("language", language || "ja")
    .eq("is_active", true)
    .single();
  if (promptRow?.content) systemPrompt = promptRow.content;

  const isEn = language === "en";
  const userMessage = isEn
    ? `Generate a team survey report.\n\nTeam: ${team.name}\nResponse count: ${sessionIds.length}\n\nCategory statistics (avg / min / max / SD):\n${JSON.stringify(statsSummary, null, 2)}\n\nWrite the report in English.`
    : `チームのサーベイレポートを生成してください。\n\nチーム名: ${team.name}\n回答者数: ${sessionIds.length}名\n\nカテゴリ別統計（平均/最小/最大/SD）:\n${JSON.stringify(statsSummary, null, 2)}\n\n日本語でレポートを作成してください。`;

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
