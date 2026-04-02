"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import {
  getTeamByAdminToken,
  getTeamStats,
  toggleResultsVisibility,
  getTeamResults,
} from "@/lib/actions/team";
import { CATEGORY_CONFIG, type QuestionCategory } from "@/lib/survey/questions";
import { getScaleLevel, calcWagonSpeed, SCALE_LEVEL_LABELS } from "@/lib/survey/scoring";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Link from "next/link";

interface TeamData {
  id: string;
  name: string;
  invite_code: string;
  deadline: string | null;
  results_visible: boolean;
  created_at: string;
}

interface TeamStats {
  memberCount: number;
  responseCount: number;
}

interface QuestionAvg {
  question_id: number;
  avg_score: number;
}

interface TeamResults {
  team_name: string;
  response_count: number;
  member_count: number;
  question_averages: QuestionAvg[] | null;
  results_visible: boolean;
}

export default function AdminDashboardPage() {
  const { locale, dict } = useLocale();
  const t = dict.team;
  const isEn = locale === "en";
  const params = useParams();
  const adminToken = params.adminToken as string;

  const [team, setTeam] = useState<TeamData | null>(null);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [results, setResults] = useState<TeamResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadData = useCallback(async () => {
    const teamData = await getTeamByAdminToken(adminToken);
    if (!teamData) {
      setLoading(false);
      return;
    }
    setTeam(teamData);

    const [statsData, resultsData] = await Promise.all([
      getTeamStats(teamData.id),
      getTeamResults(adminToken),
    ]);
    setStats(statsData);
    if (resultsData) setResults(resultsData);
    setLoading(false);
  }, [adminToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleVisibility() {
    setToggling(true);
    const result = await toggleResultsVisibility(adminToken);
    if (!("error" in result) && team) {
      setTeam({ ...team, results_visible: result.results_visible });
    }
    setToggling(false);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-400">...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <LanguageToggle />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Team not found
        </h1>
        <Link href={`/${locale}`} className="mt-6 text-blue-600 hover:underline">
          {dict.survey.backToTop}
        </Link>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${origin}/${locale}/team/join/${team.invite_code}`;

  // Calculate category scores from question averages
  const categoryScores = computeCategoryScores(results?.question_averages || []);

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <LanguageToggle />
      <div className="max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t.adminTitle}
        </h1>

        {/* Team Info */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t.teamName}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{team.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.deadline}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {team.deadline
                  ? new Date(team.deadline).toLocaleDateString(
                      isEn ? "en-US" : "ja-JP",
                      { year: "numeric", month: "short", day: "numeric" }
                    )
                  : t.noDeadline}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.memberCount}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {stats?.memberCount ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.responseCount}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {stats?.responseCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Link */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.inviteLinkLabel}
          </label>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
            />
            <CopyLinkButton text={inviteUrl} />
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.status}</p>
              <p className={`font-semibold ${team.results_visible ? "text-green-600" : "text-yellow-600"}`}>
                {team.results_visible ? t.resultsVisible : t.resultsHidden}
              </p>
            </div>
            <button
              onClick={handleToggleVisibility}
              disabled={toggling}
              className={`rounded-full px-6 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                team.results_visible
                  ? "bg-yellow-600 hover:bg-yellow-500"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {team.results_visible ? t.hideResults : t.showResults}
            </button>
          </div>
        </div>

        {/* Team Results */}
        {stats && stats.responseCount > 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t.teamResults}
            </h2>

            {/* Overall wagon speed */}
            {categoryScores.overallAvg > 0 && (
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {dict.survey.wagonForce}
                </p>
                <p className="text-5xl font-bold text-blue-600 mt-2">
                  {calcWagonSpeed(categoryScores.overallAvg)}{" "}
                  <span className="text-2xl">{dict.survey.unit}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t.overallAverage}: {categoryScores.overallAvg.toFixed(2)} / 5.00
                </p>
              </div>
            )}

            {/* Category breakdown */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.categoryScores}
            </h3>
            <div className="flex flex-col gap-3">
              {Object.entries(categoryScores.categories).map(([cat, data]) => {
                const config = CATEGORY_CONFIG[cat as QuestionCategory];
                const level = getScaleLevel(data.avg);
                const levelLabel = SCALE_LEVEL_LABELS[level];
                const widthPct = (data.avg / 5) * 100;

                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {isEn ? config.wagonPartEn : config.wagonPart} -{" "}
                        {isEn ? config.labelEn : config.label}
                      </span>
                      <span className="text-gray-500">
                        {data.avg.toFixed(2)} ({isEn ? levelLabel.en : levelLabel.ja})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          level === "excellent"
                            ? "bg-green-500"
                            : level === "good"
                            ? "bg-blue-500"
                            : level === "average"
                            ? "bg-yellow-500"
                            : level === "poor"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-gray-500">{t.noResponses}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function computeCategoryScores(questionAverages: QuestionAvg[]) {
  const qMap = new Map<number, number>();
  for (const qa of questionAverages) {
    qMap.set(qa.question_id, qa.avg_score);
  }

  const categories: Record<string, { avg: number }> = {};
  const teamCategories: QuestionCategory[] = [
    "landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness",
  ];

  let totalSum = 0;
  let totalCount = 0;

  for (const cat of [...teamCategories, "management" as QuestionCategory]) {
    const config = CATEGORY_CONFIG[cat];
    const scores = config.questionIds.map((id) => qMap.get(id)).filter((v): v is number => v != null);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    categories[cat] = { avg: Math.round(avg * 100) / 100 };

    if (teamCategories.includes(cat as QuestionCategory)) {
      totalSum += scores.reduce((a, b) => a + b, 0);
      totalCount += scores.length;
    }
  }

  const overallAvg = totalCount > 0 ? Math.round((totalSum / totalCount) * 100) / 100 : 0;

  return { categories, overallAvg };
}
