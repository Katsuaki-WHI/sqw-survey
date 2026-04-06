"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { getMemberResults } from "@/lib/actions/survey";
import { getTeamByMemberToken } from "@/lib/actions/team";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function MemberResultsPage() {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const tt = dict.team;
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

      <ResultsView
        data={results}
        title={t.yourResults}
        mode="individual"
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

        {/* AI Report */}
        {teamInfo?.teamId && (
          <div className="w-full mt-4">
            {!aiReport && !aiReportLoading && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4 text-center">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">{tt.aiReportDesc}</p>
                <button
                  onClick={async () => {
                    setAiReportLoading(true);
                    setAiReportError("");
                    try {
                      // Check cache first
                      const cacheRes = await fetch(`/api/ai-report/cache?memberToken=${memberToken}&reportType=personal&language=${locale}`);
                      const cacheData = await cacheRes.json();
                      if (cacheData.cached) {
                        setAiReport(cacheData.content);
                        setAiReportLoading(false);
                        return;
                      }
                      // Generate
                      const res = await fetch("/api/ai-report/personal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ teamId: teamInfo.teamId, memberToken, language: locale }),
                      });
                      const data = await res.json();
                      if (data.report) setAiReport(data.report);
                      else setAiReportError(data.error || tt.aiReportError);
                    } catch {
                      setAiReportError(tt.aiReportError);
                    }
                    setAiReportLoading(false);
                  }}
                  className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
                >
                  {tt.aiReportButton}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-left whitespace-pre-line">{tt.aiReportPrivacy}</p>
              </div>
            )}

            {aiReportLoading && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mb-3" />
                <p className="text-sm text-purple-600">{tt.aiReportGenerating}</p>
              </div>
            )}

            {aiReportError && (
              <p className="text-sm text-red-500 text-center">{aiReportError}</p>
            )}

            {aiReport && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">{tt.aiReportTitle}</h3>
                  <button
                    onClick={() => window.print()}
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1"
                  >
                    {tt.aiReportSavePdf}
                  </button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
