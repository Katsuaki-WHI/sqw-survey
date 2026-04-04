"use client";

import { QUESTIONS, type QuestionCategory } from "@/lib/survey/questions";
import { useLocale } from "@/lib/i18n/context";

interface InsightCardsProps {
  /** Per-question average scores (questionId -> avg) */
  scores: Record<number, number>;
  /** Per-question SD within team (questionId -> sd). Null for individual results. */
  teamSDs?: Record<number, number> | null;
  /** "individual" hides perception gap section */
  mode: "individual" | "team";
}

interface QuestionInsight {
  id: number;
  text: string;
  textEn: string;
  avg: number;
  sd: number;
  impact: number;
  wagonPart: string;
  wagonPartEn: string;
}

const TEAM_QUESTIONS = QUESTIONS.filter(
  (q) => q.type === "scale" && q.category !== "management" && q.category !== "happiness"
);

function buildInsights(
  scores: Record<number, number>,
  teamSDs?: Record<number, number> | null,
): QuestionInsight[] {
  return TEAM_QUESTIONS.map((q) => {
    const avg = scores[q.id] ?? 0;
    const sd = teamSDs?.[q.id] ?? 0;
    const corr = q.q40Correlation ?? 0;
    const impact = corr * (5 - avg) / 4;
    return {
      id: q.id,
      text: q.text,
      textEn: q.textEn,
      avg,
      sd,
      impact,
      wagonPart: q.wagonPart,
      wagonPartEn: q.wagonPartEn,
    };
  }).filter((q) => q.avg > 0);
}

function scoreColor(avg: number): string {
  if (avg >= 4.5) return "text-green-700 dark:text-green-400";
  if (avg >= 3.75) return "text-blue-700 dark:text-blue-400";
  if (avg >= 3.0) return "text-yellow-700 dark:text-yellow-400";
  if (avg >= 2.0) return "text-orange-700 dark:text-orange-400";
  return "text-red-700 dark:text-red-400";
}

function scoreBg(avg: number): string {
  if (avg >= 4.5) return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
  if (avg >= 3.75) return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
  if (avg >= 3.0) return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
  if (avg >= 2.0) return "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
  return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
}

function QuestionRow({ q, isEn }: { q: QuestionInsight; isEn: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${scoreBg(q.avg)}`}>
      <div className={`shrink-0 text-2xl font-bold ${scoreColor(q.avg)}`}>
        {q.avg.toFixed(2)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {isEn ? q.wagonPartEn : q.wagonPart} Q{q.id}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
          {isEn ? q.textEn : q.text}
        </p>
        {q.sd > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            SD={q.sd.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function InsightCards({ scores, teamSDs, mode }: InsightCardsProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const insights = buildInsights(scores, teamSDs);
  if (insights.length === 0) return null;

  // ① Perception Gaps (team only)
  const gaps = teamSDs
    ? [...insights].sort((a, b) => b.sd - a.sd).slice(0, 3)
    : [];

  // ② Strengths: low SD (< 0.85 or individual) AND high score
  const SD_THRESHOLD = 0.85;
  const consensusItems = mode === "team"
    ? insights.filter((q) => q.sd < SD_THRESHOLD && q.sd > 0)
    : insights; // individual: no SD filter
  const strengths = [...consensusItems].sort((a, b) => b.avg - a.avg).slice(0, 3);

  // ③ Challenges: low SD AND low score
  const challenges = [...consensusItems].sort((a, b) => a.avg - b.avg).slice(0, 3);

  // ④ Impact: highest impact score
  const impactItems = [...insights].sort((a, b) => b.impact - a.impact).slice(0, 3);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ① Strengths */}
      {strengths.length > 0 && (
        <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-5">
          <h3 className="text-base font-bold text-green-800 dark:text-green-300 mb-1">
            {mode === "individual"
              ? (isEn ? "Your Perceived Team Strengths" : "あなたが認識しているチームの強み")
              : (isEn ? "Team Strengths" : "チームの確かな強み")}
          </h3>
          <p className="text-xs text-green-600 dark:text-green-400 mb-4">
            {mode === "individual"
              ? (isEn ? "These are the strengths you rated highly for your team." : "あなたが高く評価したチームの強みです")
              : (isEn ? "Everyone rates these highly — your team's genuine strengths. Let's leverage them even more as a team." : "全員が高く評価している、チームの確かな強みです。チームでさらに活かしていきましょう")}
          </p>
          <div className="flex flex-col gap-3">
            {strengths.map((q) => (
              <QuestionRow key={q.id} q={q} isEn={isEn} />
            ))}
          </div>
        </div>
      )}

      {/* ② Challenges */}
      {challenges.length > 0 && (
        <div className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-5">
          <h3 className="text-base font-bold text-orange-800 dark:text-orange-300 mb-1">
            {mode === "individual"
              ? (isEn ? "Challenges You Perceive" : "あなたが感じている課題")
              : (isEn ? "Shared Challenges" : "全員が感じている課題")}
          </h3>
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
            {mode === "individual"
              ? (isEn ? "These are challenges you feel. Compare them with what your team recognizes." : "あなたが感じている課題です。チームが認識している課題と比べてみましょう")
              : (isEn ? "Everyone sees this as a challenge. Prioritize improvement here." : "全員が課題と認識しています。優先的に改善しましょう")}
          </p>
          <div className="flex flex-col gap-3">
            {challenges.map((q) => (
              <QuestionRow key={q.id} q={q} isEn={isEn} />
            ))}
          </div>
        </div>
      )}

      {/* ③ Perception Gaps - Team only */}
      {mode === "team" && gaps.length > 0 && gaps[0].sd > 0 && (
        <div className="rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-5">
          <h3 className="text-base font-bold text-purple-800 dark:text-purple-300 mb-1">
            {isEn
              ? "Questions with Perception Gaps Among Members"
              : "メンバー間で認識にズレがある設問"}
          </h3>
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-4">
            {isEn
              ? "Team members perceive these differently. Try discussing them together."
              : "この設問についてメンバー間で感じ方が異なります。チームで対話してみましょう"}
          </p>
          <div className="flex flex-col gap-3">
            {gaps.map((q) => (
              <QuestionRow key={q.id} q={q} isEn={isEn} />
            ))}
          </div>
        </div>
      )}

      {/* ④ Impact - Team only */}
      {mode === "team" && impactItems.length > 0 && (
        <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5">
          <h3 className="text-base font-bold text-blue-800 dark:text-blue-300 mb-1">
            {isEn
              ? "Highest Impact for Team Happiness"
              : "改善するとチームの幸福度が最も上がる設問"}
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
            {isEn
              ? "These questions have the greatest impact on your team's happiness. Discuss them alongside your challenges and perception gaps."
              : "チームの幸福度への影響が最も大きい設問です。課題や認識のズレと共にチームで話し合ってみましょう"}
          </p>
          <div className="flex flex-col gap-3">
            {impactItems.map((q) => (
              <QuestionRow key={q.id} q={q} isEn={isEn} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
