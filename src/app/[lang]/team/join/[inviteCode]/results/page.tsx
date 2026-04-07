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
import { CATEGORY_LABELS, getStrengthComment, getImprovementComment, getGapComment, getEngagementQuadrant, getSummaryComment } from "@/lib/survey/insight-comments";

interface QuestionAvg {
  question_id: number;
  avg_score: number;
}

export default function TeamResultsPage() {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const tt = dict.team;
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [notVisible, setNotVisible] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportError, setAiReportError] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const load = useCallback(async () => {
    const data = await getTeamResultsByInviteCode(inviteCode);

    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setTeamName(data.team.name);
    setTeamId(data.team.id);

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

      {/* Team Insights Section */}
      {results && (() => {
        const isEn = locale === "en";
        const teamCats = ["landscape","road","rope","tire","body","attitude","cargo","diversity","happiness"] as const;
        const catEntries = teamCats
          .map((cat) => ({ cat, score: results.categoryScores[cat]?.avg ?? 0 }))
          .filter((e) => e.score > 0);

        const highest = [...catEntries].sort((a, b) => b.score - a.score)[0];
        const lowest = [...catEntries].sort((a, b) => a.score - b.score)[0];

        // Gap: use questionSDs if available
        let gapCat: string | null = null;
        if (results.questionSDs) {
          // Aggregate SD by category
          const catSDs: Record<string, number[]> = {};
          for (const [qIdStr, sd] of Object.entries(results.questionSDs)) {
            const qId = Number(qIdStr);
            for (const [cat, config] of Object.entries(CATEGORY_CONFIG)) {
              if (config.questionIds.includes(qId) && cat !== "management") {
                if (!catSDs[cat]) catSDs[cat] = [];
                catSDs[cat].push(sd);
              }
            }
          }
          let maxSD = 0;
          for (const [cat, sds] of Object.entries(catSDs)) {
            const avg = sds.reduce((a, b) => a + b, 0) / sds.length;
            if (avg > maxSD) { maxSD = avg; gapCat = cat; }
          }
          if (maxSD < 0.3) gapCat = null; // too small to show
        }

        // Engagement quadrant
        const happinessAvg = results.categoryScores.happiness?.avg ?? 3;
        const missionAvg = results.categoryScores.landscape?.avg ?? 3;
        const quadrant = getEngagementQuadrant(happinessAvg, missionAvg);
        const summaryComment = getSummaryComment(quadrant, isEn);

        const getCatLabel = (cat: string) => {
          const label = CATEGORY_LABELS[cat];
          return label ? (isEn ? label.en : label.ja) : cat;
        };

        return (
          <div className="w-full max-w-3xl mx-auto mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{tt.teamInsightsTitle}</h2>
            <div className="flex flex-col gap-4">

              {/* Strength card */}
              {highest && (() => {
                const c = getStrengthComment(getCatLabel(highest.cat), highest.score.toFixed(2), isEn);
                return (
                  <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-5">
                    <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">{CATEGORY_LABELS[highest.cat]?.icon} {getCatLabel(highest.cat)}</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{c.main}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.locked}</p>
                  </div>
                );
              })()}

              {/* Improvement card */}
              {lowest && lowest.cat !== highest?.cat && (() => {
                const c = getImprovementComment(getCatLabel(lowest.cat), lowest.score.toFixed(2), isEn);
                return (
                  <div className="rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-5">
                    <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2">{CATEGORY_LABELS[lowest.cat]?.icon} {getCatLabel(lowest.cat)}</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{c.main}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.locked}</p>
                  </div>
                );
              })()}

              {/* Gap card */}
              {gapCat && (() => {
                const c = getGapComment(getCatLabel(gapCat), isEn);
                return (
                  <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5">
                    <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">{CATEGORY_LABELS[gapCat]?.icon} {getCatLabel(gapCat)}</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{c.main}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{c.data}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.locked}</p>
                  </div>
                );
              })()}

              {/* Summary card */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-5">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {isEn ? "Engagement Status" : "エンゲージメント状態"}
                </h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{summaryComment.main}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{summaryComment.locked}</p>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Team AI Report */}
      {teamId && (
        <div className="w-full max-w-3xl mx-auto mt-8">
          {!aiReport && !aiReportLoading && (
            <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4 text-center">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">{tt.aiReportTeamDesc}</p>
              <button
                onClick={async () => {
                  // Check cache first
                  const cacheRes = await fetch(`/api/ai-report/cache?teamId=${teamId}&reportType=team&language=${locale}`);
                  const cacheData = await cacheRes.json();
                  if (cacheData.cached) {
                    setAiReport(cacheData.content);
                    return;
                  }
                  setShowPurchaseModal(true);
                }}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                {tt.aiReportTeamButton}
              </button>
            </div>
          )}
          {aiReportLoading && (
            <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mb-3" />
              <p className="text-sm text-purple-600">{tt.aiReportGenerating}</p>
            </div>
          )}
          {aiReportError && <p className="text-sm text-red-500 text-center mt-2">{aiReportError}</p>}
          {aiReport && (
            <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">{tt.aiReportTitle}</h3>
                <button onClick={() => window.print()} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1">
                  {tt.aiReportSavePdf}
                </button>
              </div>
              <div
                className="ai-report-content"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: aiReport }}
              />
            </div>
          )}
        </div>
      )}

      {/* Purchase confirmation modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{tt.aiReportPurchaseTitle}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line mb-6">{tt.aiReportPurchaseBody}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {tt.aiReportPurchaseCancel}
              </button>
              <button
                onClick={async () => {
                  setShowPurchaseModal(false);
                  setAiReportLoading(true);
                  setAiReportError("");
                  try {
                    // Use invite code to find admin token — team report needs adminToken
                    // For member-initiated reports, we use a special endpoint
                    const res = await fetch("/api/ai-report/team", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ teamId, adminToken: "__member_request__", language: locale }),
                    });
                    const data = await res.json();
                    if (data.report) setAiReport(data.report);
                    else setAiReportError(data.error || tt.aiReportError);
                  } catch {
                    setAiReportError(tt.aiReportError);
                  }
                  setAiReportLoading(false);
                }}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
              >
                {tt.aiReportPurchaseConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 mt-8">
        <Link
          href={`/${locale}/team/join/${inviteCode}`}
          className="rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-500 transition-colors"
        >
          {locale === "en" ? "Back to My Results" : "自分の結果に戻る"}
        </Link>
      </div>
    </div>
  );
}
