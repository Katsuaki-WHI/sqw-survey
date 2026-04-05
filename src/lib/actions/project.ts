"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { generateInviteCode, generateAdminToken } from "@/lib/utils/tokens";

interface ProjectInput {
  name: string;
  facilitatorEmail: string;
  companyName: string;
  industry: string;
  companySize: string;
  deadline: string;
  releaseMode: string;
  inviteMessage: string;
  surveyPurpose: string;
  locale: string;
  teams: { name: string; expectedMembers: number }[];
}

export async function createProject(input: ProjectInput) {
  const supabase = await createSupabaseServer();

  if (input.teams.length === 0) {
    return { error: "At least one team is required" };
  }

  // Project name fallback to first team name
  const projectName = input.name?.trim() || input.teams[0].name;
  const projectAdminToken = generateAdminToken();

  // 1. Create project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: projectName,
      facilitator_email: input.facilitatorEmail.trim(),
      company_name: input.companyName?.trim() || null,
      industry: input.industry || null,
      company_size: input.companySize || null,
      deadline: input.deadline ? new Date(input.deadline).toISOString() : null,
      release_mode: input.releaseMode || "manual",
      invite_message: input.inviteMessage?.trim() || null,
      survey_purpose: input.surveyPurpose || null,
      admin_token: projectAdminToken,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("Failed to create project:", projectError?.message);
    return { error: "Failed to create project" };
  }

  // 2. Create teams
  const createdTeams: { name: string; inviteCode: string; expectedMembers: number }[] = [];

  for (const t of input.teams) {
    const inviteCode = generateInviteCode();
    const teamAdminToken = generateAdminToken();
    const deadline = input.deadline ? new Date(input.deadline).toISOString() : null;

    const insertData: Record<string, unknown> = {
      name: t.name.trim(),
      invite_code: inviteCode,
      admin_token: teamAdminToken,
      deadline,
      release_mode: input.releaseMode || "manual",
      project_id: project.id,
      expected_members: t.expectedMembers,
    };
    if (input.inviteMessage?.trim()) insertData.invite_message = input.inviteMessage.trim();
    if (input.facilitatorEmail?.trim()) insertData.facilitator_email = input.facilitatorEmail.trim();

    const { error: teamError } = await supabase.from("teams").insert(insertData);

    if (teamError) {
      console.error(`Failed to create team "${t.name}":`, teamError.message);
      // Try minimal insert
      const { error: retryError } = await supabase.from("teams").insert({
        name: t.name.trim(),
        invite_code: inviteCode,
        admin_token: teamAdminToken,
        deadline,
        release_mode: input.releaseMode || "manual",
      });
      if (retryError) {
        console.error("Retry also failed:", retryError.message);
        continue;
      }
    }

    createdTeams.push({ name: t.name.trim(), inviteCode, expectedMembers: t.expectedMembers });
  }

  if (createdTeams.length === 0) {
    return { error: "Failed to create any teams" };
  }

  // 3. Send email in background
  if (input.facilitatorEmail?.trim()) {
    const { sendTeamCreatedEmail } = await import("./email");
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://survey.workhappiness.co.jp";
    const locale = input.locale || "ja";

    const teamList = createdTeams
      .map((t) => `- ${t.name}: ${origin}/${locale}/team/join/${t.inviteCode}`)
      .join("\n");

    sendTeamCreatedEmail({
      to: input.facilitatorEmail.trim(),
      teamName: projectName,
      adminUrl: `${origin}/${locale}/team/admin/${projectAdminToken}`,
      inviteUrl: teamList,
      deadline: input.deadline
        ? new Date(input.deadline).toLocaleDateString(locale === "en" ? "en-US" : "ja-JP", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          })
        : null,
      locale,
    }).catch((e) => console.error("Email send error:", e));
  }

  return {
    adminToken: projectAdminToken,
    teams: createdTeams,
    projectId: project.id,
  };
}

export async function getProjectByAdminToken(adminToken: string) {
  const supabase = await createSupabaseServer();

  // Try project first
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("admin_token", adminToken)
    .single();

  if (project) {
    // Get all teams for this project
    const { data: teams } = await supabase
      .from("teams")
      .select("id, name, invite_code, admin_token, deadline, results_visible, release_mode, expected_members, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    return { project, teams: teams || [] };
  }

  return null;
}
