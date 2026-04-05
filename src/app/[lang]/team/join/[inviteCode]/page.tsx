"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { getTeamByInviteCode, joinTeam, checkMemberStatus } from "@/lib/actions/team";
import { submitSurvey } from "@/lib/actions/survey";
import SurveyFlow, { type Answers } from "@/components/survey/SurveyFlow";
import type { ResultsData } from "@/components/survey/ResultsView";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";

interface TeamInfo {
  id: string;
  name: string;
  deadline: string | null;
  results_visible: boolean;
  release_mode: string;
  description: string | null;
  leader_name: string | null;
  notes: string | null;
  invite_message: string | null;
}

export default function TeamJoinPage() {
  const { locale, dict } = useLocale();
  const t = dict.team;
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberToken, setMemberToken] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [existingMemberToken, setExistingMemberToken] = useState<string | null>(null);
  const [joinEmail, setJoinEmail] = useState("");
  const [joinName, setJoinName] = useState("");

  const loadTeam = useCallback(async () => {
    const data = await getTeamByInviteCode(inviteCode);
    if (!data) {
      setLoading(false);
      return;
    }
    setTeam(data);

    // Check deadline
    if (data.deadline && new Date(data.deadline) < new Date()) {
      setExpired(true);
    }

    // Check for existing member token in cookie
    const existing = getCookie(`sqw_member_${data.id}`);
    if (existing) {
      setMemberToken(existing);
      setExistingMemberToken(existing);
      const existingSession = getCookie(`sqw_completed_${data.id}`);
      if (existingSession) {
        // Cookie says completed — verify with DB and check reset_flag
        const status = await checkMemberStatus(existing);
        if (status.hasResponse && !status.resetFlag) {
          router.replace(`/${locale}/team/results/${existing}`);
          return;
        }
        // Reset or no response — clear cookies, allow re-answer
        document.cookie = `sqw_completed_${data.id}=; path=/; max-age=0`;
        document.cookie = `sqw_member_${data.id}=; path=/; max-age=0`;
        setMemberToken(null);
        setExistingMemberToken(null);
      }
    }

    setLoading(false);
  }, [inviteCode, locale, router]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function handleStart() {
    if (!team) return;

    let token = memberToken;
    if (!token) {
      token = await joinTeam(team.id, joinName || undefined);
      if (!token) return;
      setMemberToken(token);
      document.cookie = `sqw_member_${team.id}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }

    setStarted(true);
  }

  async function handleSurveySubmit(answers: Answers): Promise<ResultsData | void> {
    if (!team || !memberToken) return;

    const result = await submitSurvey({
      answers,
      teamId: team.id,
      memberToken,
      memberEmail: joinEmail || undefined,
    });

    if ("error" in result) {
      console.error(result.error);
      return;
    }

    // Mark as completed in cookie
    document.cookie = `sqw_completed_${team.id}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

    // Return results for immediate display
    return {
      teamAverage: result.teamAverage,
      wagonSpeed: result.wagonSpeed,
      categoryScores: result.categoryScores as Record<string, { avg: number; level: string }>,
    };
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

  if (started) {
    return (
      <SurveyFlow
        onSubmit={handleSurveySubmit}
        teamContext={
          (team.leader_name || team.notes)
            ? { leaderName: team.leader_name, notes: team.notes }
            : undefined
        }
        completedExtra={
          memberToken ? (
            <div className="flex flex-col items-center gap-3">
              <Link
                href={`/${locale}/team/join/${inviteCode}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {dict.survey.viewYourResults}
              </Link>
            </div>
          ) : undefined
        }
      />
    );
  }

  const deadlineStr = team.deadline
    ? new Date(team.deadline).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black px-6 py-16">
      <LanguageToggle />
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t.joinTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {t.joinDescription.replace("{teamName}", team.name)}
        </p>

        {/* Team details card */}
        {(team.description || team.leader_name || team.invite_message) && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 mb-4 text-left text-sm space-y-3">
            {team.leader_name && (
              <p className="text-blue-700 dark:text-blue-400 font-medium text-center">
                {t.invitedBy.replace("{leaderName}", team.leader_name)}
              </p>
            )}
            {team.invite_message && (
              <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950 rounded-lg p-3 italic text-center">
                &ldquo;{team.invite_message}&rdquo;
              </p>
            )}
            {team.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">{t.teamDescription}</p>
                <p className="text-gray-800 dark:text-gray-200">{team.description}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          {deadlineStr
            ? t.joinDeadline.replace("{deadline}", deadlineStr)
            : t.joinNoDeadline}
        </p>

        {expired && (
          <p className="text-red-600 font-medium mb-4">{t.expired}</p>
        )}

        {alreadyDone && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-600 font-medium">{t.alreadyCompleted}</p>
            {existingMemberToken && (
              <Link
                href={`/${locale}/team/results/${existingMemberToken}`}
                className="rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-500 transition-colors"
              >
                {dict.survey.viewYourResults}
              </Link>
            )}
            {(team.results_visible ||
              (team.release_mode === "on_deadline" && team.deadline && new Date(team.deadline) < new Date())
            ) && (
              <Link
                href={`/${locale}/team/join/${inviteCode}/results`}
                className="rounded-full border-2 border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                {dict.survey.viewTeamResults}
              </Link>
            )}
          </div>
        )}

        {!expired && !alreadyDone && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Name input */}
            <div className="w-full max-w-sm text-left">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t.respondentNameLabel}
              </label>
              <input
                type="text"
                placeholder={t.respondentNamePlaceholder}
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t.respondentNameHint}</p>
            </div>

            {/* Email input */}
            <div className="w-full max-w-sm text-left">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t.memberEmailLabel}
              </label>
              <input
                type="email"
                placeholder={t.memberEmailPlaceholder}
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              onClick={handleStart}
              className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              {t.joinButton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
