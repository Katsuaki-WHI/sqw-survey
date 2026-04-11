"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import { CATEGORY_CONFIG, type QuestionCategory } from "@/lib/survey/questions";
import { CATEGORY_LABELS, getStrengthComment, getImprovementComment, getGapComment, getEngagementQuadrant, getSummaryComment } from "@/lib/survey/insight-comments";
import { calcWagonSpeedFromEngagement } from "@/lib/survey/scoring";
import LanguageToggle from "@/components/LanguageToggle";
import {
  PREVIEW_MEMBERS, SAMPLE_TEAM_SCORES, SAMPLE_TEAM_SDS,
  SAMPLE_TEAM_QUESTION_SCORES, SAMPLE_TEAM_NAME, SAMPLE_TEAM_ID,
  SAMPLE_RESPONSE_COUNT, type PreviewMember,
} from "@/lib/preview-sample-data";
import { PERSONAL_REPORT_PROMPT_JA, PERSONAL_REPORT_PROMPT_EN, TEAM_REPORT_PROMPT_JA, TEAM_REPORT_PROMPT_EN } from "@/lib/ai/whi-philosophy";

type Tab = "free-personal" | "free-team" | "paid-personal" | "paid-team";

const TABS: { key: Tab; ja: string; en: string }[] = [
  { key: "free-personal", ja: "無料・個人", en: "Free Personal" },
  { key: "free-team", ja: "無料・チーム", en: "Free Team" },
  { key: "paid-personal", ja: "有料・個人AI", en: "Paid Personal AI" },
  { key: "paid-team", ja: "有料・チームAI", en: "Paid Team AI" },
];

const CAT_QUESTION_IDS: Record<string, number[]> = {
  landscape: [1, 2, 3], road: [4, 5], rope: [6, 7, 8],
  tire: [9, 10, 11], body: [12, 13, 14], attitude: [15, 16, 17, 18],
  cargo: [19, 20, 21], diversity: [22, 23, 24, 25], happiness: [26],
};

function buildResultsData(
  scores: Record<string, { avg: number; level: string }>,
  questionSDs?: Record<number, number>,
): ResultsData {
  const cats: QuestionCategory[] = ["landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness"];
  let sum = 0, count = 0;
  for (const cat of cats) {
    const s = scores[cat];
    if (s) { sum += s.avg; count++; }
  }
  const teamAverage = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;

  // Build question scores from category scores
  const questionScores: Record<number, number> = {};
  for (const [cat, qids] of Object.entries(CAT_QUESTION_IDS)) {
    const avg = scores[cat]?.avg ?? 0;
    for (const qid of qids) questionScores[qid] = avg;
  }

  const wagonSpeed = calcWagonSpeedFromEngagement(questionScores);

  return {
    teamAverage,
    wagonSpeed,
    categoryScores: scores,
    questionScores,
    questionSDs,
    engagementPoints: PREVIEW_MEMBERS.map((m) => ({
      direction: m.scores.landscape?.avg ?? 3,
      contribution: ((m.scores.body?.avg ?? 3) + (m.scores.attitude?.avg ?? 3)) / 2,
    })),
    engagementAverage: {
      direction: SAMPLE_TEAM_SCORES.landscape?.avg ?? 3,
      contribution: ((SAMPLE_TEAM_SCORES.body?.avg ?? 3) + (SAMPLE_TEAM_SCORES.attitude?.avg ?? 3)) / 2,
    },
  };
}

export default function PreviewPage() {
  const { locale, dict } = useLocale();
  const isEn = locale === "en";
  const tt = dict.team;
  const [tab, setTab] = useState<Tab>("free-personal");
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(0);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportError, setAiReportError] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const selectedMember = PREVIEW_MEMBERS[selectedMemberIdx];
  const personalData = buildResultsData(selectedMember.scores);
  const teamData = buildResultsData(SAMPLE_TEAM_SCORES, SAMPLE_TEAM_SDS);

  // Restore cached report
  useEffect(() => {
    setAiReport(null);
    setAiReportError("");
    if (tab === "paid-personal") {
      const cached = localStorage.getItem(`preview_personal_report_${selectedMember.name}_${locale}`);
      if (cached) setAiReport(cached);
    } else if (tab === "paid-team") {
      const cached = localStorage.getItem(`preview_team_report_${locale}`);
      if (cached) setAiReport(cached);
    }
  }, [tab, selectedMemberIdx, selectedMember.name, locale]);

  const clearCache = () => {
    if (tab === "paid-personal") {
      localStorage.removeItem(`preview_personal_report_${selectedMember.name}_${locale}`);
    } else if (tab === "paid-team") {
      localStorage.removeItem(`preview_team_report_${locale}`);
    }
    setAiReport(null);
  };

  const generateAiReport = async (type: "personal" | "team") => {
    setAiReportLoading(true);
    setAiReportError("");
    setAiReport(null);
    try {
      const endpoint = type === "personal" ? "/api/ai-report/personal" : "/api/ai-report/team";
      const body = type === "personal"
        ? { teamId: SAMPLE_TEAM_ID, memberToken: selectedMember.memberToken, language: locale }
        : { teamId: SAMPLE_TEAM_ID, language: locale };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.report) {
        setAiReport(data.report);
        const cacheKey = type === "personal"
          ? `preview_personal_report_${selectedMember.name}_${locale}`
          : `preview_team_report_${locale}`;
        localStorage.setItem(cacheKey, data.report);
      } else {
        setAiReportError(data.error || "生成に失敗しました");
      }
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

  const currentPrompt = tab === "paid-personal"
    ? (isEn ? PERSONAL_REPORT_PROMPT_EN : PERSONAL_REPORT_PROMPT_JA)
    : (isEn ? TEAM_REPORT_PROMPT_EN : TEAM_REPORT_PROMPT_JA);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEn ? "Preview (Dev)" : "プレビュー（開発用）"}
            <span className="ml-2 text-xs text-gray-400">CRIEN1</span>
          </h1>
          <LanguageToggle />
        </div>
        <div className="max-w-6xl mx-auto flex gap-2 mt-3 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setShowPrompt(false); }}
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

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ============================================================ */}
        {/* Tab: Free Personal                                           */}
        {/* ============================================================ */}
        {tab === "free-personal" && (
          <div>
            <MemberSelector members={PREVIEW_MEMBERS} selected={selectedMemberIdx} onChange={setSelectedMemberIdx} isEn={isEn} />
            <ResultsView data={personalData} title={isEn ? `${selectedMember.nameEn}'s Results (Preview)` : `${selectedMember.name}の結果（プレビュー）`} mode="individual" />

            <div className="mt-8 border-t-2 border-dashed border-purple-300 pt-6">
              <p className="text-xs text-purple-500 mb-4 font-bold">--- CTA Section ---</p>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-4">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {isEn ? "⚠️ Points of concern in your wagon" : "⚠️ あなたのワゴンで気になるポイント"}
                </h3>
                {teamCats
                  .map((cat) => ({ cat, score: personalData.categoryScores[cat]?.avg ?? 0, label: isEn ? CATEGORY_CONFIG[cat].labelEn : CATEGORY_CONFIG[cat].label }))
                  .filter((e) => e.score > 0).sort((a, b) => a.score - b.score).slice(0, 3)
                  .map((e) => (
                    <div key={e.cat} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300">{e.label}</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{e.score.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
              <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 p-6 shadow-sm mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{tt.ctaPersonalTitle}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tt.ctaPersonalDesc}</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                  {[tt.ctaPersonalItem1, tt.ctaPersonalItem2, tt.ctaPersonalItem3, tt.ctaPersonalItem4].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-purple-500 shrink-0">&#128275;</span><span>{item}</span></li>
                  ))}
                </ul>
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium mb-5 italic">{tt.ctaUrgency}</p>
                <button disabled className="w-full rounded-full bg-gray-400 px-6 py-3 text-base font-bold text-white cursor-not-allowed">
                  {tt.ctaPersonalButton} {isEn ? "(Preview)" : "（プレビュー）"}
                </button>
                <p className="text-xs text-gray-400 mt-4 whitespace-pre-line leading-relaxed">{tt.ctaPersonalNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* Tab: Free Team                                                */}
        {/* ============================================================ */}
        {tab === "free-team" && (
          <div>
            <div className="mb-4 text-xs text-gray-400">
              {isEn ? `${SAMPLE_TEAM_NAME} (${SAMPLE_RESPONSE_COUNT} responses)` : `${SAMPLE_TEAM_NAME}（${SAMPLE_RESPONSE_COUNT}名回答）`}
            </div>
            <ResultsView data={teamData} title={isEn ? `${SAMPLE_TEAM_NAME} - Team Results (Preview)` : `${SAMPLE_TEAM_NAME} - チーム結果（プレビュー）`} mode="team" />

            <div className="mt-8 border-t-2 border-dashed border-purple-300 pt-6">
              <p className="text-xs text-purple-500 mb-4 font-bold">--- Team Insights ---</p>
              <div className="flex flex-col gap-4">
                {highest && (() => {
                  const c = getStrengthComment(getCatLabel(highest.cat), highest.score.toFixed(2), isEn);
                  return (<div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-5"><h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">{CATEGORY_LABELS[highest.cat]?.icon} {getCatLabel(highest.cat)}</h3><p className="text-sm text-gray-800 dark:text-gray-200">{c.main}</p></div>);
                })()}
                {lowest && lowest.cat !== highest?.cat && (() => {
                  const c = getImprovementComment(getCatLabel(lowest.cat), lowest.score.toFixed(2), isEn);
                  return (<div className="rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-5"><h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2">{CATEGORY_LABELS[lowest.cat]?.icon} {getCatLabel(lowest.cat)}</h3><p className="text-sm text-gray-800 dark:text-gray-200">{c.main}</p></div>);
                })()}
                {gapCat && (() => {
                  const c = getGapComment(getCatLabel(gapCat), isEn);
                  return (<div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5"><h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">{CATEGORY_LABELS[gapCat]?.icon} {getCatLabel(gapCat)}</h3><p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{c.main}</p><p className="text-xs text-gray-600 dark:text-gray-400">{c.data}</p></div>);
                })()}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-5">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{isEn ? "Engagement Status" : "エンゲージメント状態"}</h3>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{summaryComment.main}</p>
                </div>
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">{isEn ? "💡 The full AI report goes deeper into all of the above." : "💡 上記すべての示唆を、AIが深く掘り下げて分析します。"}</p>
                  <p className="text-xs text-purple-500">{isEn ? "Recognition gaps · Priority improvements · Specific leadership guidance" : "認識ギャップの正体・改善優先カテゴリ・リーダーへの具体的示唆"}</p>
                </div>
              </div>
              <div className="mt-6 rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{tt.ctaTeamTitle}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tt.ctaTeamDesc}</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                  {[tt.ctaTeamItem1, tt.ctaTeamItem2, tt.ctaTeamItem3, tt.ctaTeamItem4].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-purple-500 shrink-0">&#128274;</span><span>{item}</span></li>
                  ))}
                </ul>
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium mb-5 italic">{tt.ctaTeamUrgency}</p>
                <button disabled className="w-full rounded-full bg-gray-400 px-6 py-3 text-base font-bold text-white cursor-not-allowed">
                  {tt.ctaTeamButton} {isEn ? "(Preview)" : "（プレビュー）"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* Tab: Paid Personal AI                                         */}
        {/* ============================================================ */}
        {tab === "paid-personal" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <MemberSelector members={PREVIEW_MEMBERS} selected={selectedMemberIdx} onChange={(i) => { setSelectedMemberIdx(i); }} isEn={isEn} />
              <button
                onClick={() => generateAiReport("personal")}
                disabled={aiReportLoading}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {aiReportLoading ? (isEn ? "Generating..." : "生成中...") : (isEn ? "Generate Report" : "レポート生成")}
              </button>
              {aiReport && (
                <button onClick={clearCache} className="text-xs text-red-500 hover:text-red-700 border border-red-300 rounded px-3 py-1">
                  {isEn ? "Clear Cache" : "キャッシュクリア"}
                </button>
              )}
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1"
              >
                {showPrompt ? (isEn ? "Hide Prompt" : "プロンプト非表示") : (isEn ? "Show Prompt" : "プロンプト表示")}
              </button>
              {aiReport && <span className="text-xs text-gray-400">{aiReport.length.toLocaleString()} chars</span>}
            </div>

            {showPrompt && (
              <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 max-h-96 overflow-auto">
                <p className="text-xs text-gray-500 mb-2 font-bold">{isEn ? "Current Prompt (PERSONAL_REPORT_PROMPT)" : "現在のプロンプト（PERSONAL_REPORT_PROMPT）"}</p>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentPrompt}</pre>
              </div>
            )}

            {aiReportError && <p className="text-sm text-red-500 mb-4">{aiReportError}</p>}
            {aiReportLoading && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-8 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-purple-600">{isEn ? `Generating for ${selectedMember.nameEn}...` : `${selectedMember.name}のレポート生成中...`}</p>
              </div>
            )}
            {aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">
                    {isEn ? `Personal AI Report: ${selectedMember.nameEn}` : `個人AIレポート: ${selectedMember.name}`}
                  </h3>
                  <button onClick={() => window.print()} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1 print:hidden">PDF</button>
                </div>
                <div className="ai-report-content" style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: aiReport }} />
              </div>
            )}
            {!aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                {isEn ? `Select a member and click 'Generate Report'` : `メンバーを選択して「レポート生成」をクリック`}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* Tab: Paid Team AI                                             */}
        {/* ============================================================ */}
        {tab === "paid-team" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <p className="text-xs text-gray-400">{isEn ? `Team: ${SAMPLE_TEAM_NAME}` : `チーム: ${SAMPLE_TEAM_NAME}`}</p>
              <button
                onClick={() => generateAiReport("team")}
                disabled={aiReportLoading}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {aiReportLoading ? (isEn ? "Generating..." : "生成中...") : (isEn ? "Generate Team Report" : "チームレポート生成")}
              </button>
              {aiReport && (
                <button onClick={clearCache} className="text-xs text-red-500 hover:text-red-700 border border-red-300 rounded px-3 py-1">
                  {isEn ? "Clear Cache" : "キャッシュクリア"}
                </button>
              )}
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1"
              >
                {showPrompt ? (isEn ? "Hide Prompt" : "プロンプト非表示") : (isEn ? "Show Prompt" : "プロンプト表示")}
              </button>
              {aiReport && <span className="text-xs text-gray-400">{aiReport.length.toLocaleString()} chars</span>}
            </div>

            {showPrompt && (
              <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 max-h-96 overflow-auto">
                <p className="text-xs text-gray-500 mb-2 font-bold">{isEn ? "Current Prompt (TEAM_REPORT_PROMPT)" : "現在のプロンプト（TEAM_REPORT_PROMPT）"}</p>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentPrompt}</pre>
              </div>
            )}

            {aiReportError && <p className="text-sm text-red-500 mb-4">{aiReportError}</p>}
            {aiReportLoading && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-8 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-purple-600">{isEn ? "Generating team report..." : "チームレポート生成中..."}</p>
              </div>
            )}
            {aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">{isEn ? "Team AI Report" : "チームAIレポート"}</h3>
                  <button onClick={() => window.print()} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1 print:hidden">PDF</button>
                </div>
                <div className="ai-report-content" style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: aiReport }} />
              </div>
            )}
            {!aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                {isEn ? "Click 'Generate Team Report' to create a report" : "「チームレポート生成」をクリックしてレポートを作成"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Member selector component */
function MemberSelector({ members, selected, onChange, isEn }: { members: PreviewMember[]; selected: number; onChange: (i: number) => void; isEn: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500">{isEn ? "Member:" : "メンバー:"}</label>
      <select
        value={selected}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {members.map((m, i) => (
          <option key={i} value={i}>
            {isEn ? m.nameEn : m.name} ({m.role === "leader" ? (isEn ? "Leader" : "リーダー") : (isEn ? "Member" : "メンバー")})
          </option>
        ))}
      </select>
    </div>
  );
}
