"use client";

import { useState } from "react";
import Image from "next/image";
import type { QuestionCategory } from "@/lib/survey/questions";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";
import { getScaleLevel, SCALE_LEVEL_LABELS } from "@/lib/survey/scoring";
import { getComment, type ScaleLevel as CommentLevel } from "@/lib/survey/comments";
import { useLocale } from "@/lib/i18n/context";
import WagonComposite from "./WagonComposite";
import WagonIllustration from "./WagonIllustration";
import ScoreRadarChart from "./ScoreRadarChart";
import InsightCards from "./InsightCards";
import EngagementMap, { type EngagementPoint } from "./EngagementMap";
import PdfDownloadButton from "./PdfDownloadButton";

interface CategoryScore {
  avg: number;
  level: string;
}

export interface ResultsData {
  teamAverage: number;
  wagonSpeed: number;
  categoryScores: Record<string, CategoryScore>;
  managementAverage?: number | null;
  /** Per-question average scores (questionId -> avg). Used for insight cards. */
  questionScores?: Record<number, number>;
  /** Per-question within-team SD (questionId -> sd). Team results only. */
  questionSDs?: Record<number, number>;
  /** Engagement map data points (all members). */
  engagementPoints?: EngagementPoint[];
  /** Team average engagement coordinates. */
  engagementAverage?: { direction: number; contribution: number } | null;
}

interface ResultsViewProps {
  data: ResultsData;
  title: string;
  mode: "individual" | "team";
}

function levelBarColor(avg: number): string {
  if (avg >= 4.5) return "bg-green-500";
  if (avg >= 3.75) return "bg-blue-500";
  if (avg >= 3.0) return "bg-yellow-500";
  if (avg >= 2.0) return "bg-orange-500";
  return "bg-red-500";
}

/** Score to image file number:
 *  4.50+ → _1.png, 3.75-4.49 → _2.png, 3.00-3.74 → _3.png, 2.00-2.99 → _4.png, <2.00 → _5.png
 */
function scoreToLevel(avg: number): number {
  if (avg >= 4.5) return 1;
  if (avg >= 3.75) return 2;
  if (avg >= 3.0) return 3;
  if (avg >= 2.0) return 4;
  return 5;
}

const CATEGORY_IMAGE_PREFIX: Record<string, string> = {
  landscape: "scenery",
  road: "road",
  rope: "rope",
  tire: "tire",
  body: "body",
  attitude: "attitude",
  cargo: "cargo",
  diversity: "diversity",
  happiness: "happiness",
};

export default function ResultsView({ data, title, mode }: ResultsViewProps) {
  const { locale, dict } = useLocale();
  const isEn = locale === "en";
  const t = dict.survey;

  const teamCategories: QuestionCategory[] = [
    "landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness",
  ];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-3xl mx-auto">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        {title}
      </h1>

      {/* Composite wagon illustration (1 layered picture) */}
      <WagonComposite
        categoryScores={data.categoryScores as Partial<Record<QuestionCategory, CategoryScore>>}
        wagonSpeed={data.wagonSpeed}
        teamAverage={data.teamAverage}
      />

      {/* Engagement map */}
      {data.engagementPoints && data.engagementPoints.length > 0 && (
        <EngagementMap
          points={data.engagementPoints}
          teamAverage={data.engagementAverage}
          mode={mode}
        />
      )}

      {/* Category illustrations grid */}
      <WagonIllustration
        categoryScores={data.categoryScores as Partial<Record<QuestionCategory, CategoryScore>>}
        wagonSpeed={data.wagonSpeed}
        teamAverage={data.teamAverage}
      />

      {/* Radar chart */}
      <div className="w-full flex justify-center">
        <ScoreRadarChart
          categoryScores={data.categoryScores as Partial<Record<QuestionCategory, CategoryScore>>}
        />
      </div>

      {/* Category breakdown with comments */}
      <CategoryBreakdown
        teamCategories={teamCategories}
        categoryScores={data.categoryScores}
        isEn={isEn}
      />

      {/* Insight cards */}
      {data.questionScores && (
        <InsightCards
          scores={data.questionScores}
          teamSDs={data.questionSDs}
          mode={mode}
        />
      )}

      {/* Management score */}
      {data.managementAverage != null && data.managementAverage > 0 && (
        <div className="w-full">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? "Trust in Management" : "経営陣への信頼"}
          </h2>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                {isEn ? "Management" : "経営"} - {isEn ? "Trust in Management" : "経営陣への信頼"}
              </span>
              <span className="text-gray-500 font-medium">
                {data.managementAverage.toFixed(2)} ({isEn ? SCALE_LEVEL_LABELS[getScaleLevel(data.managementAverage)].en : SCALE_LEVEL_LABELS[getScaleLevel(data.managementAverage)].ja})
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${levelBarColor(data.managementAverage)}`}
                style={{ width: `${(data.managementAverage / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Overall summary */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 w-full text-center">
        <p className="text-sm text-gray-500 mb-1">{t.teamAvgLabel}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {data.teamAverage.toFixed(2)} <span className="text-lg text-gray-500">/ 5.00</span>
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center">
        &copy; Work Happiness Inc.
      </p>
      {/* PDF download button */}
      <PdfDownloadButton />
    </div>
  );
}

/** Category breakdown with comments - extracted for state management */
function CategoryBreakdown({
  teamCategories,
  categoryScores,
  isEn,
}: {
  teamCategories: QuestionCategory[];
  categoryScores: Record<string, { avg: number; level: string }>;
  isEn: boolean;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {isEn ? "Category Scores" : "カテゴリ別スコア"}
      </h2>
      <div className="flex flex-col gap-4">
        {teamCategories.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const score = categoryScores[cat];
          if (!score) return null;
          const level = getScaleLevel(score.avg);
          const levelLabel = SCALE_LEVEL_LABELS[level];
          const widthPct = (score.avg / 5) * 100;
          const imageLevel = scoreToLevel(score.avg);
          const prefix = CATEGORY_IMAGE_PREFIX[cat];
          const imagePath = `/images/${prefix}_${imageLevel}.png`;

          // Get comment for this category and level
          const comment = cat !== "management"
            ? getComment(cat as Exclude<QuestionCategory, "management">, level as CommentLevel)
            : null;
          const shortComment = comment
            ? (isEn ? comment.short.en : comment.short.ja)
            : "";
          const detailComment = comment
            ? (isEn ? comment.detail.en : comment.detail.ja)
            : "";
          const isExpanded = expanded[cat] ?? false;

          return (
            <div key={cat} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <Image
                    src={imagePath}
                    alt={isEn ? config.wagonPartEn : config.wagonPart}
                    width={48}
                    height={48}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                {/* Score bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {isEn ? config.wagonPartEn : config.wagonPart} - {isEn ? config.labelEn : config.label}
                    </span>
                    <span className="text-gray-500 font-medium shrink-0 ml-2">
                      {score.avg.toFixed(2)} ({isEn ? levelLabel.en : levelLabel.ja})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${levelBarColor(score.avg)}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Short comment */}
              {shortComment && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {shortComment}
                </p>
              )}

              {/* Expand/collapse for detail */}
              {detailComment && (
                <>
                  <button
                    onClick={() => toggle(cat)}
                    className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    data-print-hide=""
                  >
                    {isExpanded
                      ? (isEn ? "Hide details" : "詳細を閉じる")
                      : (isEn ? "Show details" : "詳細を見る")}
                  </button>
                  {/* Screen: show only when expanded. Print: always show via data-print-expand */}
                  <p
                    className={`mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-l-2 border-blue-300 pl-3 ${isExpanded ? "" : "hidden"}`}
                    data-print-expand=""
                  >
                    {detailComment}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
