"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { generateInviteCode, generateAdminToken, generateMemberToken } from "@/lib/utils/tokens";

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const deadlineStr = formData.get("deadline") as string;

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
    .select("id, name, deadline, results_visible")
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
    .select("id, name, invite_code, deadline, results_visible, created_at")
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
