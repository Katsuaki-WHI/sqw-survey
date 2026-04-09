"use server";

import { createSupabaseServer } from "@/lib/supabase/server";

export interface SurveyStats {
  respondentCount: number;
  teamCount: number;
  respondentDisplay: string;
  teamDisplay: string;
  lastUpdated: string;
}

function formatCount(count: number, unit: string): string {
  if (count < 1000) return `${count}${unit}`;
  const rounded = Math.floor(count / 1000) * 1000;
  return `${rounded.toLocaleString("ja-JP")}${unit}以上`;
}

const LEGACY_RESPONDENTS = 117371;
const LEGACY_TEAMS = 9021;

export async function getSurveyStats(): Promise<SurveyStats> {
  const supabase = await createSupabaseServer();

  const { count: sessionCount } = await supabase
    .from("survey_sessions")
    .select("*", { count: "exact", head: true });

  const { count: teamCount } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  const totalRespondents = LEGACY_RESPONDENTS + (sessionCount || 0);
  const totalTeams = LEGACY_TEAMS + (teamCount || 0);

  return {
    respondentCount: totalRespondents,
    teamCount: totalTeams,
    respondentDisplay: formatCount(totalRespondents, "人"),
    teamDisplay: formatCount(totalTeams, "チーム"),
    lastUpdated: new Date().toISOString(),
  };
}
