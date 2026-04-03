"use client";

import type { QuestionCategory } from "@/lib/survey/questions";
import { useLocale } from "@/lib/i18n/context";

interface CategoryScore {
  avg: number;
  level: string;
}

interface WagonChartProps {
  categoryScores: Partial<Record<QuestionCategory, CategoryScore>>;
  wagonSpeed: number;
  size?: number;
}

// Map score level to color
function levelColor(avg: number): string {
  if (avg >= 4.5) return "#22c55e"; // green
  if (avg >= 3.75) return "#3b82f6"; // blue
  if (avg >= 3.0) return "#eab308"; // yellow
  if (avg >= 2.0) return "#f97316"; // orange
  return "#ef4444"; // red
}

function levelBg(avg: number): string {
  if (avg >= 4.5) return "#dcfce7";
  if (avg >= 3.75) return "#dbeafe";
  if (avg >= 3.0) return "#fef9c3";
  if (avg >= 2.0) return "#ffedd5";
  return "#fee2e2";
}

// Wheel roundness: higher score = rounder (more circle-like)
// At 5.0 = perfect circle, at 1.0 = very square
function wheelPath(cx: number, cy: number, r: number, score: number): string {
  const roundness = Math.max(0, Math.min(1, (score - 1) / 4));
  // Interpolate between square and circle
  const cr = r * roundness; // corner radius
  const s = r; // half-size

  if (roundness >= 0.95) {
    // Near-perfect circle
    return `M ${cx} ${cy - s} A ${s} ${s} 0 1 1 ${cx - 0.001} ${cy - s} Z`;
  }

  // Rounded square
  return [
    `M ${cx - s + cr} ${cy - s}`,
    `L ${cx + s - cr} ${cy - s}`,
    `Q ${cx + s} ${cy - s} ${cx + s} ${cy - s + cr}`,
    `L ${cx + s} ${cy + s - cr}`,
    `Q ${cx + s} ${cy + s} ${cx + s - cr} ${cy + s}`,
    `L ${cx - s + cr} ${cy + s}`,
    `Q ${cx - s} ${cy + s} ${cx - s} ${cy + s - cr}`,
    `L ${cx - s} ${cy - s + cr}`,
    `Q ${cx - s} ${cy - s} ${cx - s + cr} ${cy - s}`,
    "Z",
  ].join(" ");
}

const CATEGORY_LABELS: Record<string, { ja: string; en: string }> = {
  landscape: { ja: "景色", en: "Landscape" },
  road: { ja: "道筋", en: "Road" },
  rope: { ja: "ロープ", en: "Rope" },
  tire: { ja: "タイヤ", en: "Tire" },
  body: { ja: "体", en: "Body" },
  attitude: { ja: "態度", en: "Attitude" },
  cargo: { ja: "積荷", en: "Cargo" },
  diversity: { ja: "多様性", en: "Diversity" },
  happiness: { ja: "幸福度", en: "Happiness" },
};

export default function WagonChart({
  categoryScores,
  wagonSpeed,
  size = 480,
}: WagonChartProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const tireScore = categoryScores.tire?.avg ?? 2.5;
  const speedLabel = isEn ? "Wagon Push Force" : "ワゴン推進力";

  // Layout constants
  const w = size;
  const h = size * 0.75;
  const groundY = h * 0.78;
  const wheelR = h * 0.1;
  const cartX = w * 0.5;
  const cartY = groundY - wheelR * 2;
  const cartW = w * 0.4;
  const cartH = h * 0.22;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="max-w-full h-auto"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#skyGrad)" rx="12" />

        {/* Ground */}
        <rect x="0" y={groundY} width={w} height={h - groundY} fill="#d4c4a8" rx="0" />
        <line x1="0" y1={groundY} x2={w} y2={groundY} stroke="#b5a68a" strokeWidth="2" />

        {/* Road/path (道筋) */}
        {(() => {
          const roadScore = categoryScores.road?.avg ?? 2.5;
          const roadColor = levelColor(roadScore);
          return (
            <g>
              <line
                x1={cartX + cartW * 0.6}
                y1={groundY}
                x2={w}
                y2={groundY}
                stroke={roadColor}
                strokeWidth="4"
                strokeDasharray={roadScore >= 3.0 ? "none" : "8 4"}
              />
              <text
                x={w - 8}
                y={groundY - 6}
                textAnchor="end"
                fontSize="10"
                fill={roadColor}
                fontWeight="bold"
              >
                {isEn ? "Road" : "道筋"} {roadScore.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Landscape (景色) - sun/mountain in background */}
        {(() => {
          const score = categoryScores.landscape?.avg ?? 2.5;
          const color = levelColor(score);
          return (
            <g>
              {/* Mountain */}
              <polygon
                points={`${w * 0.7},${groundY} ${w * 0.82},${h * 0.25} ${w * 0.94},${groundY}`}
                fill={levelBg(score)}
                stroke={color}
                strokeWidth="2"
              />
              {/* Sun */}
              <circle cx={w * 0.85} cy={h * 0.15} r={h * 0.06} fill={color} opacity="0.8" />
              <text x={w * 0.85} y={h * 0.15 + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                {score.toFixed(1)}
              </text>
              <text x={w * 0.85} y={h * 0.08} textAnchor="middle" fontSize="10" fill={color} fontWeight="bold">
                {isEn ? "Landscape" : "景色"}
              </text>
            </g>
          );
        })()}

        {/* Cart body */}
        <rect
          x={cartX - cartW / 2}
          y={cartY - cartH}
          width={cartW}
          height={cartH}
          fill="#8B6914"
          stroke="#6B4F10"
          strokeWidth="2"
          rx="4"
        />
        {/* Cart bed */}
        <rect
          x={cartX - cartW / 2 - 4}
          y={cartY}
          width={cartW + 8}
          height={6}
          fill="#6B4F10"
          rx="2"
        />

        {/* Cargo (積荷) - boxes on cart */}
        {(() => {
          const score = categoryScores.cargo?.avg ?? 2.5;
          const color = levelColor(score);
          const boxY = cartY - cartH;
          return (
            <g>
              <rect
                x={cartX - cartW * 0.3}
                y={boxY - 18}
                width={cartW * 0.25}
                height={16}
                fill={levelBg(score)}
                stroke={color}
                strokeWidth="1.5"
                rx="2"
              />
              <rect
                x={cartX}
                y={boxY - 22}
                width={cartW * 0.2}
                height={20}
                fill={levelBg(score)}
                stroke={color}
                strokeWidth="1.5"
                rx="2"
              />
              <text
                x={cartX - cartW * 0.05}
                y={boxY - 24}
                textAnchor="middle"
                fontSize="9"
                fill={color}
                fontWeight="bold"
              >
                {isEn ? "Cargo" : "積荷"} {score.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Wheels (タイヤ) - square to round based on score */}
        {(() => {
          const color = levelColor(tireScore);
          const wheel1X = cartX - cartW * 0.3;
          const wheel2X = cartX + cartW * 0.3;
          const wheelY = groundY - wheelR;
          return (
            <g>
              <path d={wheelPath(wheel1X, wheelY, wheelR, tireScore)} fill={levelBg(tireScore)} stroke={color} strokeWidth="2.5" />
              <path d={wheelPath(wheel2X, wheelY, wheelR, tireScore)} fill={levelBg(tireScore)} stroke={color} strokeWidth="2.5" />
              {/* Axle dots */}
              <circle cx={wheel1X} cy={wheelY} r={3} fill={color} />
              <circle cx={wheel2X} cy={wheelY} r={3} fill={color} />
              <text x={cartX} y={groundY + 16} textAnchor="middle" fontSize="9" fill={color} fontWeight="bold">
                {isEn ? "Tire" : "タイヤ"} {tireScore.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Rope (ロープ) - from cart to puller */}
        {(() => {
          const score = categoryScores.rope?.avg ?? 2.5;
          const color = levelColor(score);
          const ropeStartX = cartX - cartW / 2;
          const ropeStartY = cartY - cartH * 0.3;
          const ropeEndX = cartX - cartW * 0.7;
          const ropeEndY = cartY - cartH * 0.5;
          return (
            <g>
              <line
                x1={ropeStartX}
                y1={ropeStartY}
                x2={ropeEndX}
                y2={ropeEndY}
                stroke={color}
                strokeWidth={Math.max(1.5, score)}
                strokeDasharray={score >= 3 ? "none" : "6 3"}
              />
              <text x={ropeEndX - 4} y={ropeEndY - 8} textAnchor="end" fontSize="9" fill={color} fontWeight="bold">
                {isEn ? "Rope" : "ロープ"} {score.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Pusher figures (body + attitude) */}
        {(() => {
          const bodyScore = categoryScores.body?.avg ?? 2.5;
          const attitudeScore = categoryScores.attitude?.avg ?? 2.5;
          const bodyColor = levelColor(bodyScore);
          const attColor = levelColor(attitudeScore);
          const px = cartX - cartW * 0.75;
          const py = groundY;
          const headR = h * 0.035;
          return (
            <g>
              {/* Person 1 */}
              <circle cx={px} cy={py - h * 0.22} r={headR} fill={bodyColor} />
              {/* Body */}
              <line x1={px} y1={py - h * 0.22 + headR} x2={px + 6} y2={py - h * 0.1} stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={px + 6} y1={py - h * 0.1} x2={px - 2} y2={py} stroke={bodyColor} strokeWidth="2" strokeLinecap="round" />
              <line x1={px + 6} y1={py - h * 0.1} x2={px + 14} y2={py} stroke={bodyColor} strokeWidth="2" strokeLinecap="round" />
              {/* Arms pushing */}
              <line x1={px} y1={py - h * 0.18} x2={px + 20} y2={py - h * 0.16} stroke={bodyColor} strokeWidth="2" strokeLinecap="round" />

              {/* Body label */}
              <text x={px - 8} y={py - h * 0.25} textAnchor="end" fontSize="9" fill={bodyColor} fontWeight="bold">
                {isEn ? "Body" : "体"} {bodyScore.toFixed(1)}
              </text>

              {/* Attitude indicator - expression/posture aura */}
              <circle cx={px} cy={py - h * 0.22} r={headR + 4} fill="none" stroke={attColor} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
              <text x={px - 8} y={py + 14} textAnchor="end" fontSize="9" fill={attColor} fontWeight="bold">
                {isEn ? "Attitude" : "態度"} {attitudeScore.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Diversity - multiple small figures */}
        {(() => {
          const score = categoryScores.diversity?.avg ?? 2.5;
          const color = levelColor(score);
          const dx = cartX - cartW * 0.95;
          const dy = groundY;
          const headR = h * 0.025;
          return (
            <g opacity="0.85">
              {/* Small person */}
              <circle cx={dx} cy={dy - h * 0.17} r={headR} fill={color} />
              <line x1={dx} y1={dy - h * 0.17 + headR} x2={dx + 4} y2={dy - h * 0.08} stroke={color} strokeWidth="2" strokeLinecap="round" />
              <line x1={dx + 4} y1={dy - h * 0.08} x2={dx - 1} y2={dy} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              <line x1={dx + 4} y1={dy - h * 0.08} x2={dx + 9} y2={dy} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              <text x={dx} y={dy + 14} textAnchor="middle" fontSize="9" fill={color} fontWeight="bold">
                {isEn ? "Diversity" : "多様性"} {score.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Happiness - heart/smile above */}
        {(() => {
          const score = categoryScores.happiness?.avg ?? 2.5;
          const color = levelColor(score);
          const hx = cartX - cartW * 0.75;
          const hy = groundY - h * 0.35;
          return (
            <g>
              <text x={hx} y={hy} textAnchor="middle" fontSize="16" fill={color}>
                {score >= 4 ? "😊" : score >= 3 ? "🙂" : score >= 2 ? "😐" : "😟"}
              </text>
              <text x={hx} y={hy - 12} textAnchor="middle" fontSize="9" fill={color} fontWeight="bold">
                {isEn ? "Happy" : "幸福度"} {score.toFixed(1)}
              </text>
            </g>
          );
        })()}

        {/* Speed display */}
        <text x={w / 2} y={h * 0.1} textAnchor="middle" fontSize="12" fill="#6b7280">
          {speedLabel}
        </text>
        <text x={w / 2} y={h * 0.18} textAnchor="middle" fontSize="28" fill="#2563eb" fontWeight="bold">
          {wagonSpeed} km
        </text>
      </svg>

      {/* Category legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
        {Object.entries(CATEGORY_LABELS).map(([cat, labels]) => {
          const score = categoryScores[cat as QuestionCategory]?.avg ?? 0;
          if (score === 0) return null;
          return (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: levelBg(score),
                color: levelColor(score),
                border: `1px solid ${levelColor(score)}`,
              }}
            >
              {isEn ? labels.en : labels.ja} {score.toFixed(2)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
