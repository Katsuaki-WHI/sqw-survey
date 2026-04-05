"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { generateInviteCode, generateAdminToken, generateMemberToken } from "@/lib/utils/tokens";
import { isResultsEffectivelyVisible } from "@/lib/utils/visibility";

export type ReleaseMode = "manual" | "all_completed" | "on_deadline";

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
  const adminEmail = (formData.get("admin_email") as string) || null;
  const locale = (formData.get("locale") as string) || "ja";

  if (!name || name.trim().length === 0) {
    return { error: "Team name is required" };
  }

  const inviteCode = generateInviteCode();
  const adminToken = generateAdminToken();
  const deadline = deadlineStr ? new Date(deadlineStr).toISOString() : null;

  const supabase = await createSupabaseServer();

  // Build insert payload — only include columns that exist in the DB
  const insertData: Record<string, unknown> = {
    name: name.trim(),
    invite_code: inviteCode,
    admin_token: adminToken,
    deadline,
    release_mode: releaseMode,
  };

  // Optional columns (added via migrations — safe to include even if column exists)
  if (description?.trim()) insertData.description = description.trim();
  if (leaderName?.trim()) insertData.leader_name = leaderName.trim();
  if (notes?.trim()) insertData.notes = notes.trim();
  if (inviteMessage?.trim()) insertData.invite_message = inviteMessage.trim();
  if (companyName?.trim()) insertData.company_name = companyName.trim();
  if (industry) insertData.industry = industry;
  if (companySize) insertData.company_size = companySize;
  if (expectedMembers) insertData.expected_members = expectedMembers;
  if (surveyPurpose) insertData.survey_purpose = surveyPurpose;
  if (adminEmail?.trim()) insertData.facilitator_email = adminEmail.trim();

  const { error } = await supabase.from("teams").insert(insertData);

  if (error) {
    console.error("Failed to create team:", error.message, error.details, error.hint);

    // Retry without optional columns if column doesn't exist
    if (error.message?.includes("column") || error.code === "42703") {
      console.log("Retrying with minimal columns...");
      const { error: retryError } = await supabase.from("teams").insert({
        name: name.trim(),
        invite_code: inviteCode,
        admin_token: adminToken,
        deadline,
        release_mode: releaseMode,
      });
      if (retryError) {
        console.error("Retry also failed:", retryError.message);
        return { error: "Failed to create team" };
      }
    } else {
      return { error: "Failed to create team" };
    }
  }

  // Send email in background (don't block)
  if (adminEmail?.trim()) {
    const { sendTeamCreatedEmail } = await import("./email");
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://survey.workhappiness.co.jp";
    sendTeamCreatedEmail({
      to: adminEmail.trim(),
      teamName: name.trim(),
      adminUrl: `${origin}/${locale}/team/admin/${adminToken}`,
      inviteUrl: `${origin}/${locale}/team/join/${inviteCode}`,
      deadline: deadline ? new Date(deadline).toLocaleDateString(locale === "en" ? "en-US" : "ja-JP", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      }) : null,
      locale,
    }).catch((e) => console.error("Email send error:", e));
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

export async function toggleResultsVisibility(adminToken: string, locale = "ja") {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, invite_code, results_visible")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return { error: "Team not found" };

  const newVisible = !team.results_visible;

  const { error } = await supabase
    .from("teams")
    .update({ results_visible: newVisible })
    .eq("id", team.id);

  if (error) return { error: "Failed to update" };

  // Send notification emails when results are being published
  if (newVisible) {
    const { data: sessions } = await supabase
      .from("survey_sessions")
      .select("member_email")
      .eq("team_id", team.id)
      .not("completed_at", "is", null)
      .not("member_email", "is", null);

    const emails = (sessions || []).map((s) => s.member_email).filter(Boolean) as string[];
    if (emails.length > 0) {
      const { sendResultsPublishedEmail } = await import("./email");
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://survey.workhappiness.co.jp";
      sendResultsPublishedEmail({
        to: emails,
        teamName: team.name,
        inviteUrl: `${origin}/${locale}/team/join/${team.invite_code}`,
        locale,
      }).catch((e) => console.error("Notification email error:", e));
    }
  }

  return { results_visible: newVisible };
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

  const updates: Record<string, unknown> = { release_mode: releaseMode };

  const { error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", team.id);

  if (error) return { error: "Failed to update release mode" };

  return { release_mode: releaseMode };
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
    teamId: member.team_id as string,
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

export async function getTeamMembers(adminToken: string) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return null;

  const { data: members } = await supabase
    .from("team_members")
    .select("id, member_token, session_id, created_at")
    .eq("team_id", team.id)
    .order("created_at", { ascending: true });

  if (!members) return [];

  const sessionIds = members.map((m) => m.session_id).filter(Boolean) as string[];
  const completedSet = new Set<string>();
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from("survey_sessions")
      .select("id")
      .in("id", sessionIds)
      .not("completed_at", "is", null);
    for (const s of sessions || []) completedSet.add(s.id);
  }

  return members.map((m, i) => ({
    id: m.id,
    memberToken: m.member_token,
    sessionId: m.session_id,
    completed: m.session_id ? completedSet.has(m.session_id) : false,
    label: `#${i + 1}`,
    joinedAt: m.created_at,
  }));
}

export async function resetMemberResponse(adminToken: string, memberId: string) {
  const supabase = await createSupabaseServer();

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("admin_token", adminToken)
    .single();

  if (!team) return { error: "Team not found" };

  const { data: member } = await supabase
    .from("team_members")
    .select("id, session_id, team_id")
    .eq("id", memberId)
    .single();

  if (!member || member.team_id !== team.id) return { error: "Member not found" };

  if (member.session_id) {
    await supabase.from("survey_sessions").delete().eq("id", member.session_id);
  }

  await supabase.from("team_members").update({ session_id: null }).eq("id", member.id);

  // If release_mode is all_completed, unpublish results since we now have an incomplete member
  const { data: teamData } = await supabase
    .from("teams")
    .select("release_mode, results_visible")
    .eq("id", team.id)
    .single();

  if (teamData?.release_mode === "all_completed" && teamData.results_visible) {
    await supabase.from("teams").update({ results_visible: false }).eq("id", team.id);
  }

  return { success: true };
}

/** Check if a member has a completed response in the DB */
export async function checkMemberHasResponse(memberToken: string) {
  const supabase = await createSupabaseServer();

  const { data: member } = await supabase
    .from("team_members")
    .select("session_id")
    .eq("member_token", memberToken)
    .single();

  if (!member?.session_id) return false;

  const { data: session } = await supabase
    .from("survey_sessions")
    .select("id")
    .eq("id", member.session_id)
    .not("completed_at", "is", null)
    .single();

  return !!session;
}

