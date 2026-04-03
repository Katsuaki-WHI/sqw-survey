"use client";

import { useLocale } from "@/lib/i18n/context";

export interface EngagementPoint {
  /** Y axis: Q02 score (1-5) */
  direction: number;
  /** X axis: (Q13 + Q19) / 2 (1-5) */
  contribution: number;
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

  // Quadrant labels
  const quadrants = [
    { x: PAD + INNER * 0.75, y: PAD + INNER * 0.15, ja: "エンゲージ型", en: "Engaged", color: "#16a34a" },
    { x: PAD + INNER * 0.25, y: PAD + INNER * 0.15, ja: "理念先行型", en: "Idealist", color: "#2563eb" },
    { x: PAD + INNER * 0.75, y: PAD + INNER * 0.85, ja: "実行先行型", en: "Executor", color: "#ca8a04" },
    { x: PAD + INNER * 0.25, y: PAD + INNER * 0.85, ja: "離脱リスク型", en: "At Risk", color: "#dc2626" },
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
        {/* Background gradient: brighter toward top-right */}
        <defs>
          <linearGradient id="mapGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="50%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>
        </defs>
        <rect
          x={PAD} y={PAD} width={INNER} height={INNER}
          fill="url(#mapGrad)"
          stroke="#e5e7eb" strokeWidth="1"
          rx="4"
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
            y={SIZE - q.y + PAD}
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
        {/* Y axis label (left) */}
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

        {/* X axis label (bottom) */}
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

        {/* Member dots (grey, behind self) */}
        {points
          .filter((p) => !p.isSelf)
          .map((p, i) => (
            <circle
              key={`m${i}`}
              cx={toPixel(p.contribution)}
              cy={SIZE - toPixel(p.direction) + PAD}
              r={5}
              fill="#9ca3af"
              opacity="0.5"
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

        {/* Self dot (large, orange, on top) */}
        {points
          .filter((p) => p.isSelf)
          .map((p, i) => (
            <g key={`s${i}`}>
              <circle
                cx={toPixel(p.contribution)}
                cy={SIZE - toPixel(p.direction) + PAD}
                r={9}
                fill="#f97316"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={toPixel(p.contribution)}
                y={SIZE - toPixel(p.direction) + PAD - 14}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#ea580c"
              >
                {isEn ? "You" : "あなた"}
              </text>
            </g>
          ))}
      </svg>
    </div>
  );
}
