"use client";

import Image from "next/image";
import type { QuestionCategory } from "@/lib/survey/questions";
import { useLocale } from "@/lib/i18n/context";

interface CategoryScore {
  avg: number;
  level: string;
}

interface WagonIllustrationProps {
  categoryScores: Partial<Record<QuestionCategory, CategoryScore>>;
  wagonSpeed: number;
  teamAverage: number;
}

/** Map QuestionCategory to image file prefix */
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

const CATEGORY_LABELS: Record<string, { ja: string; en: string }> = {
  landscape: { ja: "景色", en: "Landscape" },
  road: { ja: "道筋", en: "Road" },
  rope: { ja: "ロープ", en: "Rope" },
  tire: { ja: "タイヤ", en: "Tire" },
  body: { ja: "押す人の体", en: "Body" },
  attitude: { ja: "押す人の態度", en: "Attitude" },
  cargo: { ja: "積荷", en: "Cargo" },
  diversity: { ja: "多様性", en: "Diversity" },
  happiness: { ja: "幸福度", en: "Happiness" },
};

/** Convert avg score (1-5) to level number (1-5) for image selection.
 *  1 = とても良い (≥4.5), 2 = 良い (≥3.5), 3 = 普通 (≥2.5), 4 = 悪い (≥1.5), 5 = とても悪い (<1.5)
 */
function scoreToLevel(avg: number): number {
  if (avg >= 4.5) return 1;
  if (avg >= 3.5) return 2;
  if (avg >= 2.5) return 3;
  if (avg >= 1.5) return 4;
  return 5;
}

function levelColorClass(level: number): string {
  switch (level) {
    case 1: return "ring-green-400 bg-green-50 dark:bg-green-950";
    case 2: return "ring-blue-400 bg-blue-50 dark:bg-blue-950";
    case 3: return "ring-yellow-400 bg-yellow-50 dark:bg-yellow-950";
    case 4: return "ring-orange-400 bg-orange-50 dark:bg-orange-950";
    default: return "ring-red-400 bg-red-50 dark:bg-red-950";
  }
}

function levelBadgeClass(level: number): string {
  switch (level) {
    case 1: return "bg-green-500 text-white";
    case 2: return "bg-blue-500 text-white";
    case 3: return "bg-yellow-500 text-white";
    case 4: return "bg-orange-500 text-white";
    default: return "bg-red-500 text-white";
  }
}

const LEVEL_LABELS = {
  1: { ja: "とても良い", en: "Excellent" },
  2: { ja: "良い", en: "Good" },
  3: { ja: "普通", en: "Average" },
  4: { ja: "悪い", en: "Poor" },
  5: { ja: "とても悪い", en: "Critical" },
} as const;

const DISPLAY_ORDER: QuestionCategory[] = [
  "landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness",
];

export default function WagonIllustration({
  categoryScores,
  wagonSpeed,
  teamAverage,
}: WagonIllustrationProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  return (
    <div className="w-full">
      {/* Wagon Speed Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-1">
          {isEn ? "Wagon Push Force" : "ワゴン推進力"}
        </p>
        <p className="text-5xl font-bold text-blue-600">
          {wagonSpeed} <span className="text-2xl">km</span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isEn ? "Team Average" : "平均スコア"}: {teamAverage.toFixed(2)} / 5.00
        </p>
      </div>

      {/* Category Illustrations Grid */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {DISPLAY_ORDER.map((cat) => {
          const score = categoryScores[cat];
          if (!score) return null;

          const level = scoreToLevel(score.avg);
          const prefix = CATEGORY_IMAGE_PREFIX[cat];
          const imagePath = `/images/${prefix}_${level}.png`;
          const labels = CATEGORY_LABELS[cat];
          const levelLabel = LEVEL_LABELS[level as keyof typeof LEVEL_LABELS];

          return (
            <div
              key={cat}
              className={`relative flex flex-col items-center rounded-xl p-3 ring-2 ${levelColorClass(level)} transition-all`}
            >
              {/* Category label */}
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                {isEn ? labels.en : labels.ja}
              </p>

              {/* Illustration image */}
              <div className="relative w-full aspect-square flex items-center justify-center">
                <Image
                  src={imagePath}
                  alt={`${isEn ? labels.en : labels.ja} - ${isEn ? levelLabel.en : levelLabel.ja}`}
                  width={200}
                  height={200}
                  className="object-contain max-h-full"
                  unoptimized
                />
              </div>

              {/* Score badge */}
              <div className={`mt-2 rounded-full px-3 py-0.5 text-xs font-bold ${levelBadgeClass(level)}`}>
                {score.avg.toFixed(2)} - {isEn ? levelLabel.en : levelLabel.ja}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
