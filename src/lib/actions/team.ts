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
    .select("id, name, invite_code, deadline, results_visible, release_mode, created_at, description, leader_name, notes, invite_message")
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

  const { data, error } = await supabase.rpc("get_team_results", {
    p_admin_token: adminToken,
  });

  if (error) {
    console.error("Failed to get team results:", error);
    return null;
  }

  return data;
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

  // Get all answers for completed sessions in this team
  const { data: answers } = await supabase
    .from("survey_answers")
    .select("question_id, score, session_id")
    .not("score", "is", null);

  // Get completed session IDs for this team
  const { data: sessions } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("team_id", team.id)
    .not("completed_at", "is", null);

  const sessionIds = new Set((sessions || []).map((s) => s.id));

  // Filter and aggregate
  const qMap = new Map<number, number[]>();
  for (const a of answers || []) {
    if (!sessionIds.has(a.session_id) || a.score == null) continue;
    const scores = qMap.get(a.question_id) || [];
    scores.push(a.score);
    qMap.set(a.question_id, scores);
  }

  const questionAverages = Array.from(qMap.entries()).map(([qId, scores]) => ({
    question_id: qId,
    avg_score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
  }));

  return {
    team,
    visible: true,
    questionAverages,
    responseCount: responseCount ?? 0,
  };
}
