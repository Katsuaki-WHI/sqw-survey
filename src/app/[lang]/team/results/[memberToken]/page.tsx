"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { getMemberResults } from "@/lib/actions/survey";
import { getTeamByMemberToken } from "@/lib/actions/team";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Link from "next/link";

export default function MemberResultsPage() {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const tt = dict.team;
  const params = useParams();
  const router = useRouter();
  const memberToken = params.memberToken as string;

  const [results, setResults] = useState<ResultsData | null>(null);
  const [teamInfo, setTeamInfo] = useState<{ teamId: string; inviteCode: string; resultsVisible: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

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

        {/* Bookmark notice (②) */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {tt.bookmarkNotice}
        </p>

        {/* Retake button */}
        {teamInfo?.inviteCode && teamInfo.teamId && (
          <div className="flex flex-col items-center gap-2 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
            <button
              onClick={() => {
                document.cookie = `sqw_member_${teamInfo.teamId}=; path=/; max-age=0`;
                document.cookie = `sqw_completed_${teamInfo.teamId}=; path=/; max-age=0`;
                router.replace(`/${locale}/team/join/${teamInfo.inviteCode}`);
              }}
              className="text-sm text-red-500 hover:text-red-400 underline"
            >
              {tt.retakeButton}
            </button>
            <p className="text-xs text-gray-400 text-center max-w-sm">{tt.retakeNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
