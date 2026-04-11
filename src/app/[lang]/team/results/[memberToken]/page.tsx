"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { getMemberResults } from "@/lib/actions/survey";
import { getTeamByMemberToken } from "@/lib/actions/team";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Link from "next/link";
import { SurveyStatsDisplay } from "@/components/survey/SurveyStatsDisplay";

export default function MemberResultsPage() {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const tt = dict.team;
  const isEn = locale === "en";
  const params = useParams();
  const memberToken = params.memberToken as string;

  const [results, setResults] = useState<ResultsData | null>(null);
  const [teamInfo, setTeamInfo] = useState<{ teamId: string; inviteCode: string; resultsVisible: boolean; hasEmail: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportError, setAiReportError] = useState("");
  const [respondentName, setRespondentName] = useState("");

  const load = useCallback(async () => {
    const cookieMatch = document.cookie
      .split("; ")
      .some((c) => c.includes(`=${memberToken}`));

    if (!cookieMatch) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    const [resultData, teamData] = await Promise.all([
      getMemberResults(memberToken),
      getTeamByMemberToken(memberToken),
    ]);

    if (resultData) {
      setResults({
        teamAverage: Number(resultData.team_average) || 0,
        wagonSpeed: Number(resultData.wagon_speed) || 0,
        categoryScores: (resultData.category_scores as Record<string, { avg: number; level: string }>) || {},
        managementAverage: resultData.management_average ? Number(resultData.management_average) : null,
        questionScores: resultData.questionScores,
        engagementPoints: resultData.engagementPoints || [],
      });

      const name = resultData.respondentName || (locale === "en" ? "Member" : "メンバー");
      setRespondentName(name);
    }

    if (teamData) {
      setTeamInfo(teamData);
    }

    setLoading(false);
  }, [memberToken]);

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

  if (unauthorized || !results) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <LanguageToggle />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {unauthorized
            ? (locale === "en" ? "Access Denied" : "アクセスが拒否されました")
            : (locale === "en" ? "Results Not Found" : "結果が見つかりません")}
        </h1>
        <p className="text-gray-500 mb-6">
          {unauthorized
            ? (locale === "en" ? "You can only view your own results." : "自分の結果のみ閲覧可能です。")
            : (locale === "en" ? "The survey may not have been completed." : "サーベイが完了していない可能性があります。")}
        </p>
        <Link href={`/${locale}`} className="text-blue-600 hover:underline">
          {t.backToTop}
        </Link>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const personalUrl = `${origin}/${locale}/team/results/${memberToken}`;

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
      <LanguageToggle />

      {/* Privacy notice */}
      <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 max-w-2xl text-center">
        {t.privateNotice}
      </div>

      <div className="mb-6">
        <SurveyStatsDisplay type="respondent" variant="banner" />
        <p className="text-center text-sm text-gray-500 mt-2">
          {isEn ? "You are one of " : "あなたは今、"}
          <SurveyStatsDisplay type="respondent" variant="inline" />
          {isEn ? "" : "の一人です"}
        </p>
      </div>

      <ResultsView
        data={results}
        title={t.yourResults}
        mode="individual"
        printTitle={(() => {
          const d = new Date();
          const ds = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
          return locale === "en" ? `${ds}_SQWSurvey_PersonalResults_${respondentName}` : `${ds}_SQWサーベイ_個人結果_${respondentName}`;
        })()}
      />

      <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-lg">
        {/* Personal results URL (⑤) */}
        <div className="w-full rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">{tt.personalUrlTitle}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">{tt.personalUrlDesc}</p>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={personalUrl}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
            <CopyLinkButton text={personalUrl} />
          </div>
        </div>

        {/* Link to team results (①) */}
        {teamInfo?.resultsVisible && teamInfo.inviteCode && (
          <Link
            href={`/${locale}/team/join/${teamInfo.inviteCode}/results`}
            className="rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-500 transition-colors"
          >
            {t.viewTeamResults}
          </Link>
        )}

        {/* Email notification registration — only when results not yet published */}
        {teamInfo && !teamInfo.resultsVisible && (
          <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {teamInfo.hasEmail || emailRegistered ? (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                {emailRegistered ? `✓ ${tt.notifyEmailSuccess}` : `✓ ${tt.notifyEmailRegistered}`}
              </p>
            ) : (
              <>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {tt.notifyEmailLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                  />
                  <button
                    onClick={async () => {
                      if (!notifyEmail.trim()) return;
                      setEmailSubmitting(true);
                      const res = await fetch("/api/team/update-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ memberToken, email: notifyEmail.trim() }),
                      });
                      if (res.ok) setEmailRegistered(true);
                      setEmailSubmitting(false);
                    }}
                    disabled={emailSubmitting || !notifyEmail.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {tt.notifyEmailRegister}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bookmark notice */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {tt.bookmarkNotice}
        </p>

        {/* ============================== */}
        {/* CTA Section: 3 Blocks         */}
        {/* ============================== */}
        {teamInfo?.teamId && results && (() => {
          // Compute lowest 3 categories
          const teamCats = ["landscape","road","rope","tire","body","attitude","cargo","diversity","happiness"] as const;
          const catEntries = teamCats
            .map((cat) => ({ cat, score: results.categoryScores[cat]?.avg ?? 0, label: isEn ? CATEGORY_CONFIG[cat].labelEn : CATEGORY_CONFIG[cat].label }))
            .filter((e) => e.score > 0)
            .sort((a, b) => a.score - b.score)
            .slice(0, 3);

          // Compute highest category for free preview
          const allCatEntries = teamCats
            .map((cat) => ({ cat, score: results.categoryScores[cat]?.avg ?? 0, label: isEn ? CATEGORY_CONFIG[cat].labelEn : CATEGORY_CONFIG[cat].label }))
            .filter((e) => e.score > 0)
            .sort((a, b) => b.score - a.score);
          const topCat = allCatEntries[0];

          return (
            <div className="w-full flex flex-col gap-6 mt-8">

              {/* Block 1: Gap Preview */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {isEn
                    ? "⚠️ Points of concern in your wagon (details in the paid report)"
                    : "⚠️ あなたのワゴンで気になるポイント（有料レポートで詳細を確認）"}
                </h3>
                <div className="flex flex-col gap-2">
                  {catEntries.map((e) => (
                    <div key={e.cat} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300">{e.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{tt.ctaGapYou} {e.score.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs">{tt.ctaGapTeamAvg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free Preview: Highest category one-liner */}
              {topCat && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {isEn ? "Free Preview" : "無料プレビュー"}
                    </span>
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                      {isEn ? "Your highest category" : "あなたの最も高いカテゴリ"}
                    </span>
                  </div>
                  <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold">
                    {isEn
                      ? `"${topCat.label}" is your highest-scoring category`
                      : `「${topCat.label}」カテゴリが最も高いスコアです`}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {isEn
                      ? "✨ The paid report includes detailed analysis, how to leverage this strength, gaps with your team, and specific actions"
                      : "✨ 有料レポートでは、このカテゴリの詳細分析・強みの活かし方・チームとのギャップ・具体的アクションが届きます"}
                  </p>
                </div>
              )}

              {/* Block 2: Personal AI Report CTA */}
              {!aiReport && !aiReportLoading && (
                <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 p-6 shadow-sm">
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

                  <button
                    onClick={async () => {
                      console.log("[CTA] Personal AI Report purchase initiated");
                      setAiReportLoading(true);
                      setAiReportError("");
                      try {
                        const cacheRes = await fetch(`/api/ai-report/cache?memberToken=${memberToken}&reportType=personal&language=${locale}`);
                        const cacheData = await cacheRes.json();
                        if (cacheData.cached) { setAiReport(cacheData.content); setAiReportLoading(false); return; }
                        const res = await fetch("/api/ai-report/personal", {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ teamId: teamInfo.teamId, memberToken, language: locale }),
                        });
                        const data = await res.json();
                        if (data.report) setAiReport(data.report);
                        else setAiReportError(data.error || tt.aiReportError);
                      } catch { setAiReportError(tt.aiReportError); }
                      setAiReportLoading(false);
                    }}
                    className="w-full rounded-full bg-purple-600 px-6 py-3 text-base font-bold text-white hover:bg-purple-500 transition-colors shadow-md"
                  >
                    {tt.ctaPersonalButton}
                  </button>

                  <p className="text-xs text-gray-400 mt-4 whitespace-pre-line leading-relaxed">{tt.ctaPersonalNote}</p>
                </div>
              )}

              {aiReportLoading && (
                <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 p-8 text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-4" />
                  <p className="text-sm text-purple-600 font-medium">{tt.aiReportGenerating}</p>
                </div>
              )}

              {aiReportError && <p className="text-sm text-red-500 text-center">{aiReportError}</p>}

              {aiReport && (
                <div className="rounded-xl border border-purple-200 dark:border-purple-800 p-6">
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
          );
        })()}

      </div>
    </div>
  );
}
