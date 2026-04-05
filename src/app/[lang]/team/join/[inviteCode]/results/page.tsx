"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { getTeamResultsByInviteCode } from "@/lib/actions/team";
import { CATEGORY_CONFIG, type QuestionCategory } from "@/lib/survey/questions";
import { calcWagonSpeed, calcWagonSpeedFromEngagement } from "@/lib/survey/scoring";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";

interface QuestionAvg {
  question_id: number;
  avg_score: number;
}

export default function TeamResultsPage() {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const [teamName, setTeamName] = useState("");
  const [results, setResults] = useState<ResultsData | null>(null);
  const [notVisible, setNotVisible] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getTeamResultsByInviteCode(inviteCode);

    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setTeamName(data.team.name);

    if (!data.visible) {
      setNotVisible(true);
      setLoading(false);
      return;
    }

    setResponseCount(data.responseCount);

    // Convert question averages to category scores
    const qMap = new Map<number, number>();
    for (const qa of data.questionAverages || []) {
      qMap.set(qa.question_id, qa.avg_score);
    }

    const teamCategories: QuestionCategory[] = [
      "landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness",
    ];

    const categoryScores: Record<string, { avg: number; level: string }> = {};
    let totalSum = 0;
    let totalCount = 0;

    for (const cat of [...teamCategories, "management" as QuestionCategory]) {
      const config = CATEGORY_CONFIG[cat];
      const scores = config.questionIds
        .map((id) => qMap.get(id))
        .filter((v): v is number => v != null);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const level =
        avg >= 4.5 ? "excellent" : avg >= 3.75 ? "good" : avg >= 3.0 ? "average" : avg >= 2.0 ? "poor" : "critical";
      categoryScores[cat] = { avg: Math.round(avg * 100) / 100, level };

      if (teamCategories.includes(cat as QuestionCategory)) {
        totalSum += scores.reduce((a, b) => a + b, 0);
        totalCount += scores.length;
      }
    }

    const teamAverage = totalCount > 0 ? Math.round((totalSum / totalCount) * 100) / 100 : 0;
    const managementAverage = categoryScores.management?.avg ?? null;

    // Build questionScores for InsightCards and wagon speed
    const questionScores: Record<number, number> = {};
    for (const qa of data.questionAverages || []) {
      questionScores[qa.question_id] = qa.avg_score;
    }

    // Wagon speed from engagement (new formula: engagement² × 8)
    const wagonSpeed = calcWagonSpeedFromEngagement(questionScores);

    // Engagement average
    const points = data.engagementPoints || [];
    let engagementAverage: { direction: number; contribution: number } | null = null;
    if (points.length > 0) {
      const avgDir = points.reduce((s, p) => s + p.direction, 0) / points.length;
      const avgCont = points.reduce((s, p) => s + p.contribution, 0) / points.length;
      engagementAverage = {
        direction: Math.round(avgDir * 100) / 100,
        contribution: Math.round(avgCont * 100) / 100,
      };
    }

    setResults({
      teamAverage,
      wagonSpeed,
      categoryScores,
      managementAverage,
      questionScores,
      questionSDs: data.questionSDs ?? undefined,
      engagementPoints: points,
      engagementAverage,
    });
    setLoading(false);
  }, [inviteCode]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-400">...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <LanguageToggle />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team not found</h1>
        <Link href={`/${locale}`} className="mt-6 text-blue-600 hover:underline">{t.backToTop}</Link>
      </div>
    );
  }

  if (notVisible) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <LanguageToggle />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {teamName}
        </h1>
        <p className="text-gray-500 mb-2">{t.resultsNotAvailable}</p>
        <p className="text-sm text-gray-400 mb-6">{t.resultsWaiting}</p>
        <Link
          href={`/${locale}/team/join/${inviteCode}`}
          className="text-blue-600 hover:underline"
        >
          {t.backToTop}
        </Link>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <LanguageToggle />

      {/* Response count badge */}
      <div className="mb-4 rounded-full bg-blue-100 dark:bg-blue-900 px-4 py-1 text-sm text-blue-700 dark:text-blue-300">
        {locale === "en" ? `${responseCount} responses` : `${responseCount}件の回答`}
      </div>

      <ResultsView
        data={results}
        title={`${teamName} - ${t.teamResultsTitle}`}
        mode="team"
      />

      <div className="flex flex-col items-center gap-4 mt-8">
        <Link
          href={`/${locale}/team/join/${inviteCode}`}
          className="rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors"
        >
          {t.backToTop}
        </Link>
      </div>
    </div>
  );
}
