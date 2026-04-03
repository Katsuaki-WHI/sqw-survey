"use client";

import Image from "next/image";
import type { QuestionCategory } from "@/lib/survey/questions";
import { CATEGORY_CONFIG } from "@/lib/survey/questions";
import { getScaleLevel, SCALE_LEVEL_LABELS } from "@/lib/survey/scoring";
import { useLocale } from "@/lib/i18n/context";
import WagonComposite from "./WagonComposite";
import WagonIllustration from "./WagonIllustration";
import ScoreRadarChart from "./ScoreRadarChart";

interface CategoryScore {
  avg: number;
  level: string;
}

export interface ResultsData {
  teamAverage: number;
  wagonSpeed: number;
  categoryScores: Record<string, CategoryScore>;
  managementAverage?: number | null;
}

interface ResultsViewProps {
  data: ResultsData;
  title: string;
  mode: "individual" | "team";
}

function levelBarColor(avg: number): string {
  if (avg >= 4.5) return "bg-green-500";
  if (avg >= 3.5) return "bg-blue-500";
  if (avg >= 2.5) return "bg-yellow-500";
  if (avg >= 1.5) return "bg-orange-500";
  return "bg-red-500";
}

function scoreToLevel(avg: number): number {
  if (avg >= 4.5) return 1;
  if (avg >= 3.5) return 2;
  if (avg >= 2.5) return 3;
  if (avg >= 1.5) return 4;
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

      {/* Category breakdown bars with thumbnails */}
      <div className="w-full">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isEn ? "Category Scores" : "カテゴリ別スコア"}
        </h2>
        <div className="flex flex-col gap-4">
          {teamCategories.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const score = data.categoryScores[cat];
            if (!score) return null;
            const level = getScaleLevel(score.avg);
            const levelLabel = SCALE_LEVEL_LABELS[level];
            const widthPct = (score.avg / 5) * 100;
            const imageLevel = scoreToLevel(score.avg);
            const prefix = CATEGORY_IMAGE_PREFIX[cat];
            const imagePath = `/images/${prefix}_${imageLevel}.png`;

            return (
              <div key={cat} className="flex items-center gap-3">
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
            );
          })}
        </div>
      </div>

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
    </div>
  );
}
