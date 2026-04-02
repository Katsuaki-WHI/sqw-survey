"use client";

import type { QuestionCategory } from "@/lib/survey/questions";
import { useLocale } from "@/lib/i18n/context";

interface CategoryScore {
  avg: number;
  level: string;
}

interface ScoreRadarChartProps {
  categoryScores: Partial<Record<QuestionCategory, CategoryScore>>;
  size?: number;
}

const RADAR_CATEGORIES: { key: QuestionCategory; ja: string; en: string }[] = [
  { key: "landscape", ja: "景色", en: "Landscape" },
  { key: "road", ja: "道筋", en: "Road" },
  { key: "rope", ja: "ロープ", en: "Rope" },
  { key: "tire", ja: "タイヤ", en: "Tire" },
  { key: "body", ja: "体", en: "Body" },
  { key: "attitude", ja: "態度", en: "Attitude" },
  { key: "cargo", ja: "積荷", en: "Cargo" },
  { key: "diversity", ja: "多様性", en: "Diversity" },
  { key: "happiness", ja: "幸福度", en: "Happiness" },
];

function polarToCart(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function ScoreRadarChart({
  categoryScores,
  size = 320,
}: ScoreRadarChartProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.46;
  const n = RADAR_CATEGORIES.length;
  const angleStep = 360 / n;

  // Grid rings at 1, 2, 3, 4, 5
  const rings = [1, 2, 3, 4, 5];

  // Build data polygon
  const dataPoints = RADAR_CATEGORIES.map((cat, i) => {
    const score = categoryScores[cat.key]?.avg ?? 0;
    const r = (score / 5) * maxR;
    const angle = i * angleStep;
    return polarToCart(cx, cy, r, angle);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="max-w-full h-auto"
    >
      {/* Grid rings */}
      {rings.map((ring) => {
        const r = (ring / 5) * maxR;
        const points = Array.from({ length: n }, (_, i) => {
          const p = polarToCart(cx, cy, r, i * angleStep);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon
            key={ring}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={ring === 5 ? "1.5" : "0.8"}
          />
        );
      })}

      {/* Axis lines */}
      {RADAR_CATEGORIES.map((_, i) => {
        const p = polarToCart(cx, cy, maxR, i * angleStep);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#e5e7eb"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Data polygon */}
      <path d={dataPath} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
      ))}

      {/* Labels */}
      {RADAR_CATEGORIES.map((cat, i) => {
        const angle = i * angleStep;
        const lp = polarToCart(cx, cy, labelR, angle);
        const score = categoryScores[cat.key]?.avg ?? 0;

        // Adjust text anchor based on position
        let anchor: "start" | "middle" | "end" = "middle";
        if (lp.x < cx - 10) anchor = "end";
        else if (lp.x > cx + 10) anchor = "start";

        return (
          <g key={cat.key}>
            <text
              x={lp.x}
              y={lp.y - 4}
              textAnchor={anchor}
              fontSize="11"
              fill="#374151"
              fontWeight="600"
            >
              {isEn ? cat.en : cat.ja}
            </text>
            <text
              x={lp.x}
              y={lp.y + 10}
              textAnchor={anchor}
              fontSize="10"
              fill="#6b7280"
            >
              {score.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Center score rings labels */}
      {[1, 3, 5].map((ring) => {
        const y = cy - (ring / 5) * maxR;
        return (
          <text key={ring} x={cx + 4} y={y + 3} fontSize="8" fill="#9ca3af">
            {ring}
          </text>
        );
      })}
    </svg>
  );
}
