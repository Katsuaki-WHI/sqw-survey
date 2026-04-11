"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import { CATEGORY_CONFIG, type QuestionCategory } from "@/lib/survey/questions";
import { CATEGORY_LABELS, getStrengthComment, getImprovementComment, getGapComment, getEngagementQuadrant, getSummaryComment } from "@/lib/survey/insight-comments";
import { calcWagonSpeedFromEngagement } from "@/lib/survey/scoring";
import LanguageToggle from "@/components/LanguageToggle";
import {
  SAMPLE_PERSONAL_SCORES, SAMPLE_TEAM_SCORES, SAMPLE_TEAM_SDS,
  SAMPLE_PERSONAL_QUESTION_SCORES, SAMPLE_TEAM_QUESTION_SCORES,
  SAMPLE_RESPONDENT_NAME, SAMPLE_TEAM_NAME, SAMPLE_RESPONSE_COUNT,
} from "@/lib/preview-sample-data";

type Tab = "free-personal" | "free-team" | "paid-personal" | "paid-team";

const TABS: { key: Tab; ja: string; en: string }[] = [
  { key: "free-personal", ja: "無料・個人", en: "Free Personal" },
  { key: "free-team", ja: "無料・チーム", en: "Free Team" },
  { key: "paid-personal", ja: "有料・個人AI", en: "Paid Personal AI" },
  { key: "paid-team", ja: "有料・チームAI", en: "Paid Team AI" },
];

function buildResultsData(
  scores: Record<string, { avg: number; level: string }>,
  questionScores: Record<number, number>,
  questionSDs?: Record<number, number>,
): ResultsData {
  const cats: QuestionCategory[] = ["landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness"];
  let sum = 0, count = 0;
  for (const cat of cats) {
    const s = scores[cat];
    if (s) { sum += s.avg; count++; }
  }
  const teamAverage = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
  const wagonSpeed = calcWagonSpeedFromEngagement(questionScores);

  return {
    teamAverage,
    wagonSpeed,
    categoryScores: scores,
    questionScores,
    questionSDs,
    engagementPoints: [
      { direction: 4.2, contribution: 3.9 },
      { direction: 3.5, contribution: 3.2 },
      { direction: 2.8, contribution: 4.1 },
      { direction: 3.8, contribution: 3.6 },
      { direction: 3.2, contribution: 2.9 },
    ],
    engagementAverage: { direction: 3.5, contribution: 3.54 },
  };
}

export default function PreviewPage() {
  const { locale, dict } = useLocale();
  const isEn = locale === "en";
  const tt = dict.team;
  const [tab, setTab] = useState<Tab>("free-personal");
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportError, setAiReportError] = useState("");
  const [aiReportType, setAiReportType] = useState<"personal" | "team">("personal");

  const personalData = buildResultsData(SAMPLE_PERSONAL_SCORES, SAMPLE_PERSONAL_QUESTION_SCORES);
  const teamData = buildResultsData(SAMPLE_TEAM_SCORES, SAMPLE_TEAM_QUESTION_SCORES, SAMPLE_TEAM_SDS);

  const generateAiReport = async (type: "personal" | "team") => {
    setAiReportLoading(true);
    setAiReportError("");
    setAiReport(null);
    setAiReportType(type);
    try {
      const endpoint = type === "personal" ? "/api/ai-report/personal" : "/api/ai-report/team";
      const body = type === "personal"
        ? { teamId: "89bb1e53-f812-4846-973f-cb5a8634223c", memberToken: "GMqyp4T-s7lwKvh4nNDJIOqE", language: locale }
        : { teamId: "89bb1e53-f812-4846-973f-cb5a8634223c", language: locale };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.report) setAiReport(data.report);
      else setAiReportError(data.error || "生成に失敗しました");
    } catch {
      setAiReportError("生成に失敗しました");
    }
    setAiReportLoading(false);
  };

  // Team insights helpers
  const getCatLabel = (cat: string) => {
    const label = CATEGORY_LABELS[cat];
    return label ? (isEn ? label.en : label.ja) : cat;
  };

  const teamCats = ["landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness"] as const;
  const teamEntries = teamCats.map((cat) => ({ cat, score: teamData.categoryScores[cat]?.avg ?? 0 })).filter((e) => e.score > 0);
  const highest = [...teamEntries].sort((a, b) => b.score - a.score)[0];
  const lowest = [...teamEntries].sort((a, b) => a.score - b.score)[0];

  // Gap cat from SDs
  let gapCat: string | null = null;
  if (teamData.questionSDs) {
    const catSDs: Record<string, number[]> = {};
    for (const [qIdStr, sd] of Object.entries(teamData.questionSDs)) {
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
    if (maxSD < 0.3) gapCat = null;
  }

  const happinessAvg = teamData.categoryScores.happiness?.avg ?? 3;
  const missionAvg = teamData.categoryScores.landscape?.avg ?? 3;
  const quadrant = getEngagementQuadrant(happinessAvg, missionAvg);
  const summaryComment = getSummaryComment(quadrant, isEn);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEn ? "Preview (Dev)" : "プレビュー（開発用）"}
          </h1>
          <LanguageToggle />
        </div>
        <div className="max-w-5xl mx-auto flex gap-2 mt-3 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setAiReport(null); setAiReportError(""); }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {isEn ? t.en : t.ja}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab: Free Personal */}
        {tab === "free-personal" && (
          <div>
            <div className="mb-4 text-xs text-gray-400">
              {isEn ? `Sample: ${SAMPLE_RESPONDENT_NAME}` : `サンプル回答者: ${SAMPLE_RESPONDENT_NAME}`}
            </div>
            <ResultsView
              data={personalData}
              title={isEn ? "Your Survey Results (Preview)" : "あなたのサーベイ結果（プレビュー）"}
              mode="individual"
            />

            {/* CTA Section Preview */}
            <div className="mt-8 border-t-2 border-dashed border-purple-300 pt-6">
              <p className="text-xs text-purple-500 mb-4 font-bold">--- CTA Section (Preview) ---</p>

              {/* Block 1: Gap Preview */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-4">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {isEn ? "⚠️ Points of concern in your wagon" : "⚠️ あなたのワゴンで気になるポイント"}
                </h3>
                {teamCats
                  .map((cat) => ({ cat, score: personalData.categoryScores[cat]?.avg ?? 0, label: isEn ? CATEGORY_CONFIG[cat].labelEn : CATEGORY_CONFIG[cat].label }))
                  .filter((e) => e.score > 0)
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 3)
                  .map((e) => (
                    <div key={e.cat} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300">{e.label}</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{e.score.toFixed(2)}</span>
                    </div>
                  ))}
              </div>

              {/* Block 2: Personal CTA */}
              <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 p-6 shadow-sm mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{tt.ctaPersonalTitle}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tt.ctaPersonalDesc}</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                  {[tt.ctaPersonalItem1, tt.ctaPersonalItem2, tt.ctaPersonalItem3, tt.ctaPersonalItem4].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 shrink-0">&#128275;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium mb-5 italic">{tt.ctaUrgency}</p>
                <button disabled className="w-full rounded-full bg-gray-400 px-6 py-3 text-base font-bold text-white cursor-not-allowed">
                  {tt.ctaPersonalButton} {isEn ? "(Preview - disabled)" : "（プレビュー・無効）"}
                </button>
                <p className="text-xs text-gray-400 mt-4 whitespace-pre-line leading-relaxed">{tt.ctaPersonalNote}</p>
              </div>

              {/* Block 3: Leader Teaser */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tt.ctaLeaderTitle}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{tt.ctaLeaderDesc}</p>
                <button disabled className="rounded-full border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm text-gray-400 cursor-not-allowed">
                  {tt.ctaLeaderButton}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Free Team */}
        {tab === "free-team" && (
          <div>
            <div className="mb-4 text-xs text-gray-400">
              {isEn ? `Sample: ${SAMPLE_TEAM_NAME} (${SAMPLE_RESPONSE_COUNT} responses)` : `サンプルチーム: ${SAMPLE_TEAM_NAME}（${SAMPLE_RESPONSE_COUNT}名回答）`}
            </div>
            <ResultsView
              data={teamData}
              title={isEn ? `${SAMPLE_TEAM_NAME} - Team Results (Preview)` : `${SAMPLE_TEAM_NAME} - チーム結果（プレビュー）`}
              mode="team"
            />

            {/* Team Insights Section */}
            <div className="mt-8 border-t-2 border-dashed border-purple-300 pt-6">
              <p className="text-xs text-purple-500 mb-4 font-bold">--- Team Insights Section (Preview) ---</p>
              <div className="flex flex-col gap-4">
                {highest && (() => {
                  const c = getStrengthComment(getCatLabel(highest.cat), highest.score.toFixed(2), isEn);
                  return (
                    <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-5">
                      <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">{CATEGORY_LABELS[highest.cat]?.icon} {getCatLabel(highest.cat)}</h3>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{c.main}</p>
                    </div>
                  );
                })()}
                {lowest && lowest.cat !== highest?.cat && (() => {
                  const c = getImprovementComment(getCatLabel(lowest.cat), lowest.score.toFixed(2), isEn);
                  return (
                    <div className="rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-5">
                      <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2">{CATEGORY_LABELS[lowest.cat]?.icon} {getCatLabel(lowest.cat)}</h3>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{c.main}</p>
                    </div>
                  );
                })()}
                {gapCat && (() => {
                  const c = getGapComment(getCatLabel(gapCat), isEn);
                  return (
                    <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5">
                      <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">{CATEGORY_LABELS[gapCat]?.icon} {getCatLabel(gapCat)}</h3>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{c.main}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{c.data}</p>
                    </div>
                  );
                })()}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-5">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {isEn ? "Engagement Status" : "エンゲージメント状態"}
                  </h3>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{summaryComment.main}</p>
                </div>
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                    {isEn ? "💡 The full AI report goes deeper into all of the above." : "💡 上記すべての示唆を、AIが深く掘り下げて分析します。"}
                  </p>
                  <p className="text-xs text-purple-500">
                    {isEn ? "Recognition gaps · Priority improvements · Specific leadership guidance" : "認識ギャップの正体・改善優先カテゴリ・リーダーへの具体的示唆"}
                  </p>
                </div>
              </div>

              {/* Team CTA */}
              <div className="mt-6 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4 text-center">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">{tt.aiReportTeamDesc}</p>
                <button disabled className="rounded-full bg-gray-400 px-6 py-2 text-sm font-medium text-white cursor-not-allowed">
                  {tt.aiReportTeamButton} {isEn ? "(Preview)" : "（プレビュー）"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Paid Personal AI */}
        {tab === "paid-personal" && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <p className="text-xs text-gray-400">
                {isEn ? "Uses test data (Jelly / CRIEN1 team)" : "テストデータ使用（Jelly / CRIEN1チーム）"}
              </p>
              <button
                onClick={() => generateAiReport("personal")}
                disabled={aiReportLoading}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {aiReportLoading && aiReportType === "personal"
                  ? (isEn ? "Generating..." : "生成中...")
                  : (isEn ? "Generate Personal Report" : "個人レポート生成")}
              </button>
            </div>
            {aiReportError && <p className="text-sm text-red-500 mb-4">{aiReportError}</p>}
            {aiReportLoading && aiReportType === "personal" && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-8 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-purple-600">{isEn ? "Generating report (~30s)..." : "レポート生成中（約30秒）..."}</p>
              </div>
            )}
            {aiReport && aiReportType === "personal" && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">
                    {isEn ? "Personal AI Report" : "個人AIレポート"}
                  </h3>
                  <span className="text-xs text-gray-400">{aiReport.length.toLocaleString()} chars</span>
                </div>
                <div
                  className="ai-report-content"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: aiReport }}
                />
              </div>
            )}
            {!aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                {isEn ? "Click 'Generate' to create a report using test data" : "「個人レポート生成」をクリックしてテストデータでレポートを作成"}
              </div>
            )}
          </div>
        )}

        {/* Tab: Paid Team AI */}
        {tab === "paid-team" && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <p className="text-xs text-gray-400">
                {isEn ? "Uses test data (CRIEN1 team)" : "テストデータ使用（CRIEN1チーム）"}
              </p>
              <button
                onClick={() => generateAiReport("team")}
                disabled={aiReportLoading}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {aiReportLoading && aiReportType === "team"
                  ? (isEn ? "Generating..." : "生成中...")
                  : (isEn ? "Generate Team Report" : "チームレポート生成")}
              </button>
            </div>
            {aiReportError && <p className="text-sm text-red-500 mb-4">{aiReportError}</p>}
            {aiReportLoading && aiReportType === "team" && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-8 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-purple-600">{isEn ? "Generating report (~30s)..." : "レポート生成中（約30秒）..."}</p>
              </div>
            )}
            {aiReport && aiReportType === "team" && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">
                    {isEn ? "Team AI Report" : "チームAIレポート"}
                  </h3>
                  <span className="text-xs text-gray-400">{aiReport.length.toLocaleString()} chars</span>
                </div>
                <div
                  className="ai-report-content"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: aiReport }}
                />
              </div>
            )}
            {!aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                {isEn ? "Click 'Generate' to create a report using test data" : "「チームレポート生成」をクリックしてテストデータでレポートを作成"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
