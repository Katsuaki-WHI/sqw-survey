"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import {
  getTeamByAdminToken,
  getTeamStats,
  toggleResultsVisibility,
  getTeamResults,
  updateDeadline,
  updateReleaseMode,
  type ReleaseMode,
} from "@/lib/actions/team";
import { CATEGORY_CONFIG, type QuestionCategory } from "@/lib/survey/questions";
import { calcWagonSpeed } from "@/lib/survey/scoring";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import ResultsView, { type ResultsData } from "@/components/survey/ResultsView";
import Link from "next/link";

interface TeamData {
  id: string;
  name: string;
  invite_code: string;
  deadline: string | null;
  results_visible: boolean;
  release_mode: string;
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

interface TeamResultsRaw {
  team_name: string;
  response_count: number;
  member_count: number;
  question_averages: QuestionAvg[] | null;
  results_visible: boolean;
}

function computeResultsData(questionAverages: QuestionAvg[]): ResultsData {
  const qMap = new Map<number, number>();
  for (const qa of questionAverages) {
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
    const scores = config.questionIds.map((id) => qMap.get(id)).filter((v): v is number => v != null);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const level =
      avg >= 4.5 ? "excellent" : avg >= 3.5 ? "good" : avg >= 2.5 ? "average" : avg >= 1.5 ? "poor" : "critical";
    categoryScores[cat] = { avg: Math.round(avg * 100) / 100, level };

    if (teamCategories.includes(cat as QuestionCategory)) {
      totalSum += scores.reduce((a, b) => a + b, 0);
      totalCount += scores.length;
    }
  }

  const teamAverage = totalCount > 0 ? Math.round((totalSum / totalCount) * 100) / 100 : 0;
  const wagonSpeed = calcWagonSpeed(teamAverage);
  const managementAverage = categoryScores.management?.avg ?? null;

  return { teamAverage, wagonSpeed, categoryScores, managementAverage };
}

export default function AdminDashboardPage() {
  const { locale, dict } = useLocale();
  const t = dict.team;
  const isEn = locale === "en";
  const params = useParams();
  const adminToken = params.adminToken as string;

  const [team, setTeam] = useState<TeamData | null>(null);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [rawResults, setRawResults] = useState<TeamResultsRaw | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [updatingDeadline, setUpdatingDeadline] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadData = useCallback(async () => {
    const teamData = await getTeamByAdminToken(adminToken);
    if (!teamData) {
      setLoading(false);
      return;
    }
    setTeam(teamData);
    if (teamData.deadline) {
      setDeadlineInput(new Date(teamData.deadline).toISOString().slice(0, 16));
    }

    const [statsData, resultsData] = await Promise.all([
      getTeamStats(teamData.id),
      getTeamResults(adminToken),
    ]);
    setStats(statsData);
    if (resultsData) setRawResults(resultsData as TeamResultsRaw);
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

  async function handleUpdateDeadline() {
    setUpdatingDeadline(true);
    const result = await updateDeadline(adminToken, deadlineInput || null);
    if (!("error" in result) && team) {
      setTeam({ ...team, deadline: result.deadline ?? null });
      showToast(t.deadlineUpdated);
    }
    setUpdatingDeadline(false);
  }

  async function handleRemoveDeadline() {
    setUpdatingDeadline(true);
    const result = await updateDeadline(adminToken, null);
    if (!("error" in result) && team) {
      setTeam({ ...team, deadline: null });
      setDeadlineInput("");
      showToast(t.deadlineUpdated);
    }
    setUpdatingDeadline(false);
  }

  async function handleUpdateReleaseMode(mode: ReleaseMode) {
    setUpdatingMode(true);
    const result = await updateReleaseMode(adminToken, mode);
    if (!("error" in result) && team) {
      setTeam({
        ...team,
        release_mode: result.release_mode,
        results_visible: result.results_visible ?? team.results_visible,
      });
      showToast(t.releaseModeUpdated);
    }
    setUpdatingMode(false);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team not found</h1>
        <Link href={`/${locale}`} className="mt-6 text-blue-600 hover:underline">{dict.survey.backToTop}</Link>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${origin}/${locale}/team/join/${team.invite_code}`;

  const hasResponses = stats && stats.responseCount > 0;
  const resultsData = hasResponses && rawResults?.question_averages
    ? computeResultsData(rawResults.question_averages)
    : null;

  const releaseModes: { value: ReleaseMode; label: string; desc: string }[] = [
    { value: "manual", label: t.releaseModeManual, desc: t.releaseModeManualDesc },
    { value: "on_deadline", label: t.releaseModeOnDeadline, desc: t.releaseModeOnDeadlineDesc },
    { value: "immediate", label: t.releaseModeImmediate, desc: t.releaseModeImmediateDesc },
  ];

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <LanguageToggle />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg animate-pulse">
          {toast}
        </div>
      )}

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
                      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                    )
                  : t.noDeadline}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.memberCount}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{stats?.memberCount ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.responseCount}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{stats?.responseCount ?? 0}</p>
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

        {/* ===================== */}
        {/* Feedback Control Panel */}
        {/* ===================== */}
        <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {t.feedbackControl}
          </h2>

          {/* Deadline Extension */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.extendDeadline}
            </label>
            <div className="flex gap-2 items-end flex-wrap">
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateDeadline}
                disabled={updatingDeadline || !deadlineInput}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {updatingDeadline ? t.updating : t.updateDeadline}
              </button>
              {team.deadline && (
                <button
                  onClick={handleRemoveDeadline}
                  disabled={updatingDeadline}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {t.removeDeadline}
                </button>
              )}
            </div>
          </div>

          {/* Release Mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t.releaseModeLabel}
            </label>
            <div className="flex flex-col gap-2">
              {releaseModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => handleUpdateReleaseMode(mode.value)}
                  disabled={updatingMode}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                    team.release_mode === mode.value
                      ? "border-blue-600 bg-white dark:bg-gray-900"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        team.release_mode === mode.value
                          ? "border-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {team.release_mode === mode.value && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {mode.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Visibility Toggle (only when manual mode) */}
          {team.release_mode === "manual" && (
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
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
          )}

          {/* Status indicator for non-manual modes */}
          {team.release_mode !== "manual" && (
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  team.results_visible || team.release_mode === "immediate"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`} />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {team.results_visible || team.release_mode === "immediate"
                    ? t.resultsVisible
                    : team.release_mode === "on_deadline"
                    ? (team.deadline
                        ? `${t.releaseModeOnDeadlineDesc} (${new Date(team.deadline).toLocaleDateString(isEn ? "en-US" : "ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })})`
                        : t.noDeadline)
                    : t.resultsHidden}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Team Results with Wagon Visualization */}
        {resultsData ? (
          <div className="mt-8">
            <ResultsView
              data={resultsData}
              title={`${team.name} - ${t.teamResults}`}
              mode="team"
            />
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
