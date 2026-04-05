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

/** Map score (1-5) to pixel position within the inner area. Clamps to 1-5 range. */
function toPixel(score: number): number {
  const clamped = Math.max(1, Math.min(5, score));
  return PAD + ((clamped - 1) / 4) * INNER;
}

/** Q26 happiness score to dot color */
function happinessColor(score: number | undefined): string {
  if (score == null) return "#9ca3af";
  if (score >= 4.0) return "#16A34A";
  if (score >= 3.0) return "#F59E0B";
  return "#DC2626";
}

/** Midpoint score for axis divider */
const MID = 3;

const NEAR_THRESHOLD = 0.3;
const JITTER_AMOUNT = 0.15;

interface PlottedPoint extends EngagementPoint {
  /** Adjusted coordinates after jitter */
  plotX: number;
  plotY: number;
  /** Number of points at exact same coordinate (for concentric ring) */
  overlapCount: number;
  /** Index within the overlap group */
  overlapIndex: number;
}

/** Deterministic pseudo-random based on index */
function seededJitter(index: number, seed: number): number {
  const x = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // -1 to 1
}

function computePlottedPoints(points: EngagementPoint[]): PlottedPoint[] {
  console.log('[computePlottedPoints] input:', JSON.stringify(points));
  // Round to 2 decimal places for exact-match grouping
  const round = (v: number) => Math.round(v * 100) / 100;

  // Group by exact coordinate
  const exactGroups = new Map<string, number[]>();
  points.forEach((p, i) => {
    const key = `${round(p.contribution)},${round(p.direction)}`;
    const group = exactGroups.get(key) || [];
    group.push(i);
    exactGroups.set(key, group);
  });

  // Build plotted points with overlap info
  const plotted: PlottedPoint[] = points.map((p, i) => {
    const key = `${round(p.contribution)},${round(p.direction)}`;
    const group = exactGroups.get(key)!;
    return {
      ...p,
      plotX: p.contribution,
      plotY: p.direction,
      overlapCount: group.length,
      overlapIndex: group.indexOf(i),
    };
  });

  // Apply jitter to near (but not exact) neighbors
  for (let i = 0; i < plotted.length; i++) {
    for (let j = i + 1; j < plotted.length; j++) {
      const a = plotted[i];
      const b = plotted[j];
      // Skip exact overlaps (handled by concentric rings)
      if (round(a.plotX) === round(b.plotX) && round(a.plotY) === round(b.plotY)) continue;

      const dx = a.plotX - b.plotX;
      const dy = a.plotY - b.plotY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < NEAR_THRESHOLD && dist > 0) {
        // Apply small jitter to both
        plotted[i] = {
          ...a,
          plotX: a.plotX + seededJitter(i, 1) * JITTER_AMOUNT,
          plotY: a.plotY + seededJitter(i, 2) * JITTER_AMOUNT,
        };
        plotted[j] = {
          ...b,
          plotX: b.plotX + seededJitter(j, 3) * JITTER_AMOUNT,
          plotY: b.plotY + seededJitter(j, 4) * JITTER_AMOUNT,
        };
      }
    }
  }

  console.log('[computePlottedPoints] output:', JSON.stringify(plotted));
  return plotted;
}

function DotWithOverlap({
  p,
  r,
  showLabel,
  label,
  isEn,
}: {
  p: PlottedPoint;
  r: number;
  showLabel?: boolean;
  label?: string;
  isEn: boolean;
}) {
  // For exact overlaps, only render the first dot (index 0) with ring + count
  if (p.overlapCount > 1 && p.overlapIndex > 0) return null;

  const cx = toPixel(p.plotX);
  const cy = SIZE - toPixel(p.plotY) + PAD;
  const color = happinessColor(p.happiness);

  return (
    <g>
      {/* Concentric ring for exact overlaps */}
      {p.overlapCount > 1 && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 4 + Math.min(p.overlapCount - 1, 3) * 3}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
      )}
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        opacity={p.isSelf ? 1 : 0.7}
        stroke="white"
        strokeWidth={p.isSelf ? 2 : 1.5}
      />
      {/* Overlap count badge */}
      {p.overlapCount > 1 && (
        <text
          x={cx}
          y={cy + 3.5}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="white"
        >
          {p.overlapCount}
        </text>
      )}
      {/* Label (for self dot) */}
      {showLabel && (
        <text
          x={cx}
          y={cy - r - 6}
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={color}
        >
          {label || (isEn ? "You" : "あなた")}
        </text>
      )}
    </g>
  );
}

export default function EngagementMap({
  points,
  teamAverage,
  mode,
}: EngagementMapProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const midPx = toPixel(MID);
  const plotted = computePlottedPoints(points);

  console.log(`[EngagementMap] points: ${points.length}, plotted: ${plotted.length}, mode: ${mode}`);
  plotted.forEach((p, i) => {
    console.log(`  dot${i}: dir=${p.direction}, cont=${p.contribution}, hap=${p.happiness}, isSelf=${p.isSelf}, overlap=${p.overlapCount}/${p.overlapIndex}, plot=(${p.plotX.toFixed(2)},${p.plotY.toFixed(2)})`);
  });

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

        {/* Data points */}
        <g clipPath="url(#mapClip)">
          {mode === "team" ? (
            <>
              {plotted.map((p, i) => (
                <DotWithOverlap key={`t${i}`} p={p} r={8} isEn={isEn} />
              ))}
            </>
          ) : (
            <>
              {plotted
                .filter((p) => !p.isSelf)
                .map((p, i) => (
                  <DotWithOverlap key={`m${i}`} p={p} r={5} isEn={isEn} />
                ))}
              {plotted
                .filter((p) => p.isSelf)
                .map((p, i) => (
                  <DotWithOverlap key={`s${i}`} p={p} r={9} showLabel isEn={isEn} />
                ))}
            </>
          )}
        </g>

        {/* Team average star */}
        {teamAverage && (
          <g clipPath="url(#mapClip)">
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
