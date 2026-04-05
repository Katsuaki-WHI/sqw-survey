"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { generateInviteCode, generateAdminToken, generateMemberToken } from "@/lib/utils/tokens";
import { isResultsEffectivelyVisible } from "@/lib/utils/visibility";

export type ReleaseMode = "immediate" | "on_deadline" | "manual";

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const deadlineStr = formData.get("deadline") as string;
  const releaseMode = (formData.get("release_mode") as ReleaseMode) || "manual";
  const description = (formData.get("description") as string) || null;
  const leaderName = (formData.get("leader_name") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const inviteMessage = (formData.get("invite_message") as string) || null;
  const companyName = (formData.get("company_name") as string) || null;
  const industry = (formData.get("industry") as string) || null;
  const companySize = (formData.get("company_size") as string) || null;
  const expectedMembersStr = formData.get("expected_members") as string;
  const expectedMembers = expectedMembersStr ? parseInt(expectedMembersStr, 10) : null;
  const surveyPurpose = (formData.get("survey_purpose") as string) || null;

  if (!name || name.trim().length === 0) {
    return { error: "Team name is required" };
  }

  const inviteCode = generateInviteCode();
  const adminToken = generateAdminToken();
  const deadline = deadlineStr ? new Date(deadlineStr).toISOString() : null;

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("teams").insert({
    name: name.trim(),
    invite_code: inviteCode,
    admin_token: adminToken,
    deadline,
    release_mode: releaseMode,
    description: description?.trim() || null,
    leader_name: leaderName?.trim() || null,
    notes: notes?.trim() || null,
    invite_message: inviteMessage?.trim() || null,
    company_name: companyName?.trim() || null,
    industry: industry || null,
    company_size: companySize || null,
    expected_members: expectedMembers,
    survey_purpose: surveyPurpose || null,
  });

  if (error) {
    console.error("Failed to create team:", error);
    return { error: "Failed to create team" };
  }

  return { inviteCode, adminToken };
}

export async function getTeamByInviteCode(inviteCode: string) {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("teams")
    .select("id, name, deadline, results_visible, release_mode, description, leader_name, notes, invite_message")
    .eq("invite_code", inviteCode)
    .single();

  if (error || !data) return null;
  return data;
}

export async function joinTeam(teamId: string) {
  const memberToken = generateMemberToken();
  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    member_token: memberToken,
  });

  if (error) {
    console.error("Failed to join team:", error);
    return null;
  }

  return memberToken;
}

export async function getTeamByAdminToken(adminToken: string) {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("teams")
    .select("id, name, invite_code, deadline, results_visible, release_mode, created_at, description, leader_name, notes, invite_message, company_name, industry, company_size, expected_members, survey_purpose")
    .eq("admin_token", adminToken)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getTeamStats(teamId: string) {
  const supabase = await createSupabaseServer();

  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  const { count: responseCount } = await supabase
    .from("survey_sessions")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId)
    .not("completed_at", "is", null);

  return {
    memberCount: memberCount ?? 0,
    responseCount: responseCount ?? 0,
  };
}

export async function toggleResultsVisibility(adminToken: string) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id, results_visible")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return { error: "Team not found" };

  const { error } = await supabase
    .from("teams")
    .update({ results_visible: !team.results_visible })
    .eq("id", team.id);

  if (error) return { error: "Failed to update" };

  return { results_visible: !team.results_visible };
}

export async function updateDeadline(adminToken: string, newDeadline: string | null) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return { error: "Team not found" };

  const deadline = newDeadline ? new Date(newDeadline).toISOString() : null;

  const { error } = await supabase
    .from("teams")
    .update({ deadline })
    .eq("id", team.id);

  if (error) return { error: "Failed to update deadline" };

  return { deadline };
}

export async function updateReleaseMode(adminToken: string, releaseMode: ReleaseMode) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return { error: "Team not found" };

  // If switching to immediate, also set results_visible = true
  const updates: Record<string, unknown> = { release_mode: releaseMode };
  if (releaseMode === "immediate") {
    updates.results_visible = true;
  }

  const { error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", team.id);

  if (error) return { error: "Failed to update release mode" };

  return { release_mode: releaseMode, results_visible: releaseMode === "immediate" ? true : undefined };
}

export async function getTeamResults(adminToken: string) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, results_visible")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return null;

  // Get response count
  const { count: responseCount } = await supabase
    .from("survey_sessions")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id)
    .not("completed_at", "is", null);

  // Get completed session IDs for this team
  const { data: sessions } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("team_id", team.id)
    .not("completed_at", "is", null);

  const sessionIds = (sessions || []).map((s) => s.id);

  if (sessionIds.length === 0) {
    return {
      team_name: team.name,
      response_count: 0,
      member_count: 0,
      question_averages: null,
      results_visible: team.results_visible,
    };
  }

  // Get all answers for these sessions
  const { data: answers } = await supabase
    .from("survey_answers")
    .select("question_id, score, session_id")
    .in("session_id", sessionIds)
    .not("score", "is", null);

  // Aggregate by question
  const qMap = new Map<number, number[]>();
  for (const a of answers || []) {
    const scores = qMap.get(a.question_id) || [];
    scores.push(a.score);
    qMap.set(a.question_id, scores);
  }

  const questionAverages = Array.from(qMap.entries()).map(([qId, scores]) => ({
    question_id: qId,
    avg_score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
  }));

  // Calculate per-question SD
  const questionSDs: Record<number, number> = {};
  for (const [qId, scores] of qMap.entries()) {
    if (scores.length < 2) { questionSDs[qId] = 0; continue; }
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
    questionSDs[qId] = Math.round(Math.sqrt(variance) * 100) / 100;
  }

  // Build per-session engagement data
  const sessionAnswers = new Map<string, Map<number, number>>();
  for (const a of answers || []) {
    if (!sessionAnswers.has(a.session_id)) sessionAnswers.set(a.session_id, new Map());
    sessionAnswers.get(a.session_id)!.set(a.question_id, a.score);
  }

  console.log(`[getTeamResults] sessionIds: ${sessionIds.length}, answers: ${(answers || []).length}, sessionAnswers: ${sessionAnswers.size}`);
  for (const [sid, sa] of sessionAnswers.entries()) {
    console.log(`  session ${sid.slice(0, 8)}: Q02=${sa.get(2)}, Q13=${sa.get(13)}, Q19=${sa.get(19)}, Q26=${sa.get(26)}, keys=${Array.from(sa.keys()).length}`);
  }

  // Build engagement points - one per session, always included
  const engagementPoints: { direction: number; contribution: number; happiness: number }[] = [];
  for (const sid of sessionIds) {
    const sa = sessionAnswers.get(sid);
    const dir = Math.max(1, sa?.get(2) ?? 1);
    const q13 = sa?.get(13) ?? 1;
    const q19 = sa?.get(19) ?? 1;
    const contrib = Math.max(1, (q13 + q19) / 2);
    const hap = sa?.get(26) ?? 1;
    engagementPoints.push({ direction: dir, contribution: contrib, happiness: hap });
  }
  console.log(`[getTeamResults] engagementPoints: ${engagementPoints.length}`);

  // Get member count
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  return {
    team_name: team.name,
    response_count: responseCount ?? 0,
    member_count: memberCount ?? 0,
    question_averages: questionAverages,
    question_sds: questionSDs,
    engagement_points: engagementPoints,
    results_visible: team.results_visible,
  };
}

export async function getTeamByMemberToken(memberToken: string) {
  const supabase = await createSupabaseServer();

  const { data: member } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("member_token", memberToken)
    .single();

  if (!member) return null;

  const { data: team } = await supabase
    .from("teams")
    .select("invite_code, results_visible, release_mode, deadline")
    .eq("id", member.team_id)
    .single();

  if (!team) return null;

  // Determine effective visibility
  const isVisible = isResultsEffectivelyVisible(
    team.results_visible,
    team.release_mode,
    team.deadline,
  );

  return {
    inviteCode: team.invite_code as string,
    resultsVisible: isVisible,
  };
}

export async function getTeamResultsByInviteCode(inviteCode: string) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, results_visible, deadline, release_mode")
    .eq("invite_code", inviteCode)
    .single();

  if (!team) return null;

  // Check if results should be visible based on release_mode
  const visible = isResultsEffectivelyVisible(
    team.results_visible,
    team.release_mode,
    team.deadline,
  );

  if (!visible) {
    return { team, visible: false, questionAverages: null, responseCount: 0 };
  }

  // Get response count
  const { count: responseCount } = await supabase
    .from("survey_sessions")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id)
    .not("completed_at", "is", null);

  // Get completed session IDs for this team
  const { data: sessions } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("team_id", team.id)
    .not("completed_at", "is", null);

  const sessionIdList = (sessions || []).map((s) => s.id);
  const sessionIds = new Set(sessionIdList);

  if (sessionIdList.length === 0) {
    return {
      team,
      visible: true,
      questionAverages: [],
      questionSDs: {},
      engagementPoints: [],
      responseCount: responseCount ?? 0,
    };
  }

  // Get answers only for this team's sessions
  const { data: answers } = await supabase
    .from("survey_answers")
    .select("question_id, score, session_id")
    .in("session_id", sessionIdList)
    .not("score", "is", null);

  // Aggregate by question
  const qMap = new Map<number, number[]>();
  for (const a of answers || []) {
    const scores = qMap.get(a.question_id) || [];
    scores.push(a.score);
    qMap.set(a.question_id, scores);
  }

  const questionAverages = Array.from(qMap.entries()).map(([qId, scores]) => ({
    question_id: qId,
    avg_score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
  }));

  // Calculate per-question SD
  const questionSDs: Record<number, number> = {};
  for (const [qId, scores] of qMap.entries()) {
    if (scores.length < 2) { questionSDs[qId] = 0; continue; }
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
    questionSDs[qId] = Math.round(Math.sqrt(variance) * 100) / 100;
  }

  // Build per-session engagement data (Q2=direction, Q13+Q19/2=contribution, Q26=happiness)
  const sessionAnswers = new Map<string, Map<number, number>>();
  for (const a of answers || []) {
    if (!sessionAnswers.has(a.session_id)) sessionAnswers.set(a.session_id, new Map());
    sessionAnswers.get(a.session_id)!.set(a.question_id, a.score);
  }

  console.log(`[getTeamResultsByInviteCode] sessionIdList: ${sessionIdList.length}, answers: ${(answers || []).length}, sessionAnswers: ${sessionAnswers.size}`);
  for (const [sid, sa] of sessionAnswers.entries()) {
    console.log(`  session ${sid.slice(0, 8)}: Q02=${sa.get(2)}, Q13=${sa.get(13)}, Q19=${sa.get(19)}, Q26=${sa.get(26)}, keys=${Array.from(sa.keys()).length}`);
  }

  // Build engagement points - one per session, always included
  const engagementPoints: { direction: number; contribution: number; happiness: number }[] = [];
  // Ensure every session gets a point even if no answers found in sessionAnswers
  for (const sid of sessionIdList) {
    const sMap = sessionAnswers.get(sid);
    const dir = Math.max(1, sMap?.get(2) ?? 1);
    const q13 = sMap?.get(13) ?? 1;
    const q19 = sMap?.get(19) ?? 1;
    const contrib = Math.max(1, (q13 + q19) / 2);
    const hap = sMap?.get(26) ?? 1;
    engagementPoints.push({ direction: dir, contribution: contrib, happiness: hap });
  }
  console.log(`[getTeamResultsByInviteCode] engagementPoints: ${engagementPoints.length}`);

  return {
    team,
    visible: true,
    questionAverages,
    questionSDs,
    engagementPoints,
    responseCount: responseCount ?? 0,
  };
}
