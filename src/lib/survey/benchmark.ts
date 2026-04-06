import { createSupabaseServer } from "@/lib/supabase/server";
import { CATEGORY_CONFIG, getCategoryConfigForVersion, type SurveyVersion } from "./questions";

interface AddToBenchmarkParams {
  teamId: string;
  surveyVersion: SurveyVersion;
  scores: Record<number, number>; // questionId -> score
  industry: string | null;
  companySize: string | null;
  teamSize: number | null;
  isCustom: boolean;
  legacyDataFlag?: boolean;
}

/**
 * Add a completed response to the benchmark database.
 * Called automatically after submitSurvey completes.
 */
export async function addToBenchmark({
  teamId,
  surveyVersion,
  scores,
  industry,
  companySize,
  teamSize,
  isCustom,
  legacyDataFlag = false,
}: AddToBenchmarkParams): Promise<void> {
  if (isCustom) return; // Don't benchmark custom surveys

  const supabase = await createSupabaseServer();
  const catConfig = getCategoryConfigForVersion(surveyVersion);

  // Calculate category averages (excluding management)
  const categoryAverages: Record<string, number> = {};
  let totalSum = 0;
  let totalCount = 0;

  for (const [cat, config] of Object.entries(catConfig)) {
    if (cat === "management") continue;
    const catScores = config.questionIds
      .map((id) => scores[id])
      .filter((v): v is number => v != null);
    if (catScores.length === 0) continue;
    const avg = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    categoryAverages[cat] = Math.round(avg * 100) / 100;
    totalSum += catScores.reduce((a, b) => a + b, 0);
    totalCount += catScores.length;
  }

  const overallAverage = totalCount > 0
    ? Math.round((totalSum / totalCount) * 100) / 100
    : 0;

  const { error } = await supabase.from("benchmark_responses").insert({
    survey_version: surveyVersion,
    data_source: "sqw2",
    industry,
    company_size: companySize,
    team_size: teamSize,
    scores,
    category_averages: categoryAverages,
    overall_average: overallAverage,
    is_custom: false,
    legacy_data_flag: legacyDataFlag,
  });

  if (error) {
    console.error("[benchmark] Failed to add response:", error.message);
  }
}

/**
 * Get benchmark statistics for comparison.
 * Returns category averages filtered by version and optionally by industry/size.
 */
export async function getBenchmarkStats(params: {
  surveyVersion: SurveyVersion;
  industry?: string | null;
  companySize?: string | null;
}): Promise<Record<string, { avg: number; count: number }>> {
  const supabase = await createSupabaseServer();

  // Try to get pre-computed stats first
  let query = supabase
    .from("benchmark_stats")
    .select("category, avg_score, sample_count")
    .eq("survey_version", params.surveyVersion);

  if (params.industry) {
    query = query.eq("industry", params.industry);
  } else {
    query = query.is("industry", null);
  }
  if (params.companySize) {
    query = query.eq("company_size", params.companySize);
  } else {
    query = query.is("company_size", null);
  }

  const { data: stats } = await query;

  if (stats && stats.length > 0) {
    const result: Record<string, { avg: number; count: number }> = {};
    for (const s of stats) {
      result[s.category] = { avg: s.avg_score, count: s.sample_count };
    }
    return result;
  }

  // Fallback: compute from raw data
  let rawQuery = supabase
    .from("benchmark_responses")
    .select("category_averages")
    .eq("survey_version", params.surveyVersion)
    .eq("is_custom", false);

  if (params.industry) rawQuery = rawQuery.eq("industry", params.industry);

  const { data: responses } = await rawQuery;

  if (!responses || responses.length === 0) return {};

  const catSums: Record<string, { sum: number; count: number }> = {};
  for (const r of responses) {
    const cats = r.category_averages as Record<string, number>;
    for (const [cat, avg] of Object.entries(cats)) {
      if (!catSums[cat]) catSums[cat] = { sum: 0, count: 0 };
      catSums[cat].sum += avg;
      catSums[cat].count += 1;
    }
  }

  const result: Record<string, { avg: number; count: number }> = {};
  for (const [cat, data] of Object.entries(catSums)) {
    result[cat] = {
      avg: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count,
    };
  }
  return result;
}
