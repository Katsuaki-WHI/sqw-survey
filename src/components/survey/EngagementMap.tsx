"use client";

import { useLocale } from "@/lib/i18n/context";

export interface EngagementPoint {
  /** Y axis: Q02 score (1-5) */
  direction: number;
  /** X axis: (Q13 + Q19) / 2 (1-5) */
  contribution: number;
  /** Q26 happiness score (1-5) for dot color */
  happiness?: number;
  /** true = current user's own dot */
  isSelf?: boolean;
}

interface EngagementMapProps {
  points: EngagementPoint[];
  /** Team average point (shown as ★) */
  teamAverage?: { direction: number; contribution: number } | null;
  mode: "individual" | "team";
}

const SIZE = 400;
const PAD = 48;
const INNER = SIZE - PAD * 2;

/** Map score (1-5) to pixel position within the inner area */
function toPixel(score: number): number {
  return PAD + ((score - 1) / 4) * INNER;
}

/** Q26 happiness score to dot color */
function happinessColor(score: number | undefined): string {
  if (score == null) return "#9ca3af"; // grey fallback
  if (score >= 4.0) return "#16A34A"; // green
  if (score >= 3.0) return "#F59E0B"; // yellow
  return "#DC2626"; // red
}

/** Midpoint score for axis divider */
const MID = 3;

export default function EngagementMap({
  points,
  teamAverage,
  mode,
}: EngagementMapProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const midPx = toPixel(MID);

  // Quadrant labels — positions are in SVG coordinates (y=0 is top)
  const quadrants = [
    { x: PAD + INNER * 0.75, svgY: PAD + INNER * 0.20, ja: "エンゲージ型", en: "Engaged", color: "#16a34a" },
    { x: PAD + INNER * 0.25, svgY: PAD + INNER * 0.20, ja: "理念先行型", en: "Idealist", color: "#2563eb" },
    { x: PAD + INNER * 0.75, svgY: PAD + INNER * 0.80, ja: "実行先行型", en: "Executor", color: "#ca8a04" },
    { x: PAD + INNER * 0.25, svgY: PAD + INNER * 0.80, ja: "離脱リスク型", en: "At Risk", color: "#dc2626" },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        {isEn ? "Journey Position Map" : "現在地マップ"}
      </h2>
      <p className="text-xs text-gray-500">
        {isEn ? "Engagement Coordinates" : "エンゲージメント座標"}
      </p>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="max-w-full h-auto"
      >
        {/* Background */}
        <defs>
          <clipPath id="mapClip">
            <rect x={PAD} y={PAD} width={INNER} height={INNER} rx="4" />
          </clipPath>
        </defs>
        <rect
          x={PAD} y={PAD} width={INNER} height={INNER}
          fill="white"
          stroke="#e5e7eb" strokeWidth="1"
          rx="4"
        />
        {/* Background image — swap public/images/engagement-map-bg.png to change */}
        <image
          href="/images/engagement-map-bg.png"
          x={PAD} y={PAD} width={INNER} height={INNER}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#mapClip)"
          opacity="0.3"
        />

        {/* Grid lines (light) */}
        {[1.5, 2, 2.5, 3.5, 4, 4.5].map((v) => (
          <g key={v}>
            <line
              x1={toPixel(v)} y1={PAD} x2={toPixel(v)} y2={SIZE - PAD}
              stroke="#f3f4f6" strokeWidth="0.5"
            />
            <line
              x1={PAD} y1={SIZE - toPixel(v) + PAD} x2={SIZE - PAD} y2={SIZE - toPixel(v) + PAD}
              stroke="#f3f4f6" strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Center dividers (dashed) */}
        <line
          x1={midPx} y1={PAD} x2={midPx} y2={SIZE - PAD}
          stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 4"
        />
        <line
          x1={PAD} y1={SIZE - midPx + PAD} x2={SIZE - PAD} y2={SIZE - midPx + PAD}
          stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 4"
        />

        {/* Quadrant labels */}
        {quadrants.map((q) => (
          <text
            key={q.en}
            x={q.x}
            y={q.svgY}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill={q.color}
            opacity="0.35"
          >
            {isEn ? q.en : q.ja}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={PAD - 6}
          y={SIZE / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#6b7280"
          transform={`rotate(-90, ${PAD - 6}, ${SIZE / 2})`}
        >
          {isEn ? "Direction (Purpose)" : "方向性（目的への共感）"}
        </text>
        <text
          x={SIZE / 2}
          y={SIZE - PAD + 32}
          textAnchor="middle"
          fontSize="11"
          fill="#6b7280"
        >
          {isEn ? "Contribution (Competence + Belonging)" : "貢献意欲（有能感＋仲間感）"}
        </text>

        {/* Scale labels */}
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <text
              x={toPixel(v)}
              y={SIZE - PAD + 16}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {v}
            </text>
            <text
              x={PAD - 10}
              y={SIZE - toPixel(v) + PAD + 3}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Member dots (colored by happiness, behind self) */}
        {points
          .filter((p) => !p.isSelf)
          .map((p, i) => (
            <circle
              key={`m${i}`}
              cx={toPixel(p.contribution)}
              cy={SIZE - toPixel(p.direction) + PAD}
              r={5}
              fill={happinessColor(p.happiness)}
              opacity="0.6"
              stroke="white"
              strokeWidth="1"
            />
          ))}

        {/* Team average star */}
        {teamAverage && (
          <g>
            <text
              x={toPixel(teamAverage.contribution)}
              y={SIZE - toPixel(teamAverage.direction) + PAD + 5}
              textAnchor="middle"
              fontSize="20"
              fill="#eab308"
              stroke="#854d0e"
              strokeWidth="0.5"
            >
              ★
            </text>
            <text
              x={toPixel(teamAverage.contribution)}
              y={SIZE - toPixel(teamAverage.direction) + PAD + 18}
              textAnchor="middle"
              fontSize="8"
              fill="#854d0e"
              fontWeight="bold"
            >
              {isEn ? "Team Avg" : "チーム平均"}
            </text>
          </g>
        )}

        {/* Self dot (large, colored by happiness, on top) */}
        {points
          .filter((p) => p.isSelf)
          .map((p, i) => {
            const color = happinessColor(p.happiness);
            return (
              <g key={`s${i}`}>
                <circle
                  cx={toPixel(p.contribution)}
                  cy={SIZE - toPixel(p.direction) + PAD}
                  r={9}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={toPixel(p.contribution)}
                  y={SIZE - toPixel(p.direction) + PAD - 14}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={color}
                >
                  {isEn ? "You" : "あなた"}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#16A34A" /></svg>
          {isEn ? "High Happiness (4-5)" : "幸福度高（4〜5）"}
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#F59E0B" /></svg>
          {isEn ? "Moderate (3-4)" : "幸福度中（3〜4）"}
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#DC2626" /></svg>
          {isEn ? "Low Happiness (1-3)" : "幸福度低（1〜3）"}
        </span>
      </div>
    </div>
  );
}
