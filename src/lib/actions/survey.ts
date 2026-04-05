"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { calcTeamAverage, calcWagonSpeed, calcCategoryScores } from "@/lib/survey/scoring";

interface SubmitSurveyParams {
  answers: Record<number, number | string>;
  teamId?: string;
  memberToken?: string;
  memberEmail?: string;
}

export async function submitSurvey({ answers, teamId, memberToken, memberEmail }: SubmitSurveyParams) {
  const supabase = await createSupabaseServer();

  // Calculate scores from scale answers
  const scaleAnswers: Record<number, number> = {};
  for (const [key, val] of Object.entries(answers)) {
    if (typeof val === "number") {
      scaleAnswers[Number(key)] = val;
    }
  }

  const teamAverage = calcTeamAverage(scaleAnswers);
  const wagonSpeed = calcWagonSpeed(teamAverage);
  const categoryScores = calcCategoryScores(scaleAnswers);

  // Calculate management average
  const mgmtIds = [27, 28, 29, 30, 31];
  const mgmtScores = mgmtIds.map((id) => scaleAnswers[id]).filter((v) => v != null);
  const managementAverage =
    mgmtScores.length > 0
      ? Math.round((mgmtScores.reduce((a, b) => a + b, 0) / mgmtScores.length) * 100) / 100
      : null;

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("survey_sessions")
    .insert({
      team_id: teamId || null,
      completed_at: new Date().toISOString(),
      team_average: teamAverage,
      wagon_speed: wagonSpeed,
      category_scores: categoryScores,
      management_average: managementAverage,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("Failed to create session:", sessionError);
    return { error: "Failed to submit survey" };
  }

  // Insert answers
  const answerRows = Object.entries(answers).map(([questionId, value]) => ({
    session_id: session.id,
    question_id: Number(questionId),
    score: typeof value === "number" ? value : null,
    free_text: typeof value === "string" ? value : null,
  }));

  const { error: answersError } = await supabase
    .from("survey_answers")
    .insert(answerRows);

  if (answersError) {
    console.error("Failed to insert answers:", answersError);
    return { error: "Failed to save answers" };
  }

  // Link session to team member if applicable
  if (teamId && memberToken) {
    const updates: Record<string, unknown> = { session_id: session.id };
    if (memberEmail?.trim()) {
      updates.email = memberEmail.trim();
    }
    await supabase
      .from("team_members")
      .update(updates)
      .eq("member_token", memberToken)
      .eq("team_id", teamId);
  }

  return {
    sessionId: session.id,
    teamAverage,
    wagonSpeed,
    categoryScores,
  };
}

export async function getMemberResults(memberToken: string) {
  const supabase = await createSupabaseServer();

  const { data: member } = await supabase
    .from("team_members")
    .select("session_id, team_id")
    .eq("member_token", memberToken)
    .single();

  if (!member?.session_id) return null;

  const { data: session } = await supabase
    .from("survey_sessions")
    .select("team_average, wagon_speed, category_scores, management_average")
    .eq("id", member.session_id)
    .single();

  if (!session) return null;

  // Get individual answers for questionScores and engagement
  const { data: answers } = await supabase
    .from("survey_answers")
    .select("question_id, score")
    .eq("session_id", member.session_id)
    .not("score", "is", null);

  const questionScores: Record<number, number> = {};
  for (const a of answers || []) {
    questionScores[a.question_id] = a.score;
  }

  // Build self-only engagement point (individual results show only own dot)
  const direction = Math.max(1, questionScores[2] ?? 1);
  const q13 = questionScores[13] ?? 1;
  const q19 = questionScores[19] ?? 1;
  const contribution = Math.max(1, (q13 + q19) / 2);
  const happiness = questionScores[26] ?? 1;
  const engagementPoints = [{ direction, contribution, happiness, isSelf: true as const }];
  console.log(`[getMemberResults] engagementPoints:`, JSON.stringify(engagementPoints));

  return {
    ...session,
    questionScores,
    engagementPoints,
  };
}
