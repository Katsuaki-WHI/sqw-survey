"use client";

import { useLocale } from "@/lib/i18n/context";

interface SpeedMeterProps {
  speed: number;
  teamAverage: number;
}

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2 + 20;
const RADIUS = 110;
const STROKE = 18;

/** Speed (0-200) to angle in radians. 0km = -180°(left), 200km = 0°(right) */
function speedToAngle(speed: number): number {
  const clamped = Math.max(0, Math.min(200, speed));
  return Math.PI - (clamped / 200) * Math.PI; // π to 0
}

function polarToXY(angle: number, r: number): { x: number; y: number } {
  return { x: CX + r * Math.cos(angle), y: CY - r * Math.sin(angle) };
}

/** Speed to color */
function speedColor(speed: number): string {
  if (speed >= 150) return "#16a34a"; // green
  if (speed >= 100) return "#ca8a04"; // yellow-ish
  if (speed >= 50) return "#ea580c";  // orange
  return "#dc2626"; // red
}

function arcPath(startAngle: number, endAngle: number, r: number): string {
  const start = polarToXY(startAngle, r);
  const end = polarToXY(endAngle, r);
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
  // SVG arc sweeps clockwise (y-axis inverted), so sweep=0 for our coordinate system
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function SpeedMeter({ speed, teamAverage }: SpeedMeterProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const needleAngle = speedToAngle(speed);
  const needleTip = polarToXY(needleAngle, RADIUS - 8);
  const needleBase1 = polarToXY(needleAngle + Math.PI / 2, 5);
  const needleBase2 = polarToXY(needleAngle - Math.PI / 2, 5);

  // Color segments: red(0-50), orange(50-100), yellow(100-150), green(150-200)
  const segments = [
    { from: 0, to: 50, color: "#fecaca", active: "#dc2626" },
    { from: 50, to: 100, color: "#fed7aa", active: "#ea580c" },
    { from: 100, to: 150, color: "#fef08a", active: "#ca8a04" },
    { from: 150, to: 200, color: "#bbf7d0", active: "#16a34a" },
  ];

  // Scale tick marks
  const ticks = [0, 25, 50, 75, 100, 125, 150, 175, 200];

  const svgH = SIZE / 2 + 50;

  return (
    <div className="flex flex-col items-center">
      {/* To swap gauge background: place image at public/images/speedometer-bg.png
          and set SPEEDOMETER_USE_IMAGE=true in SpeedMeter.tsx */}
      <svg viewBox={`0 0 ${SIZE} ${svgH}`} width={SIZE} className="max-w-full h-auto">
        {/* Background arc segments */}
        {segments.map((seg) => {
          const a1 = speedToAngle(seg.from);
          const a2 = speedToAngle(seg.to);
          const isActive = speed >= seg.from;
          return (
            <path
              key={seg.from}
              d={arcPath(a1, a2, RADIUS)}
              fill="none"
              stroke={isActive ? seg.active : seg.color}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              opacity={isActive ? (speed >= seg.to ? 0.3 : 0.6) : 0.2}
            />
          );
        })}

        {/* Active arc up to current speed */}
        {speed > 0 && (
          <path
            d={arcPath(speedToAngle(0), speedToAngle(Math.min(speed, 200)), RADIUS)}
            fill="none"
            stroke={speedColor(speed)}
            strokeWidth={STROKE}
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        {/* Tick marks and labels */}
        {ticks.map((v) => {
          const angle = speedToAngle(v);
          const outer = polarToXY(angle, RADIUS + STROKE / 2 + 2);
          const inner = polarToXY(angle, RADIUS + STROKE / 2 - 4);
          const label = polarToXY(angle, RADIUS + STROKE / 2 + 14);
          return (
            <g key={v}>
              <line
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="#9ca3af" strokeWidth="1.5"
              />
              <text
                x={label.x} y={label.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill="#9ca3af"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${CX},${CY} ${needleBase2.x},${needleBase2.y}`}
          fill={speedColor(speed)}
          stroke={speedColor(speed)}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Center cap */}
        <circle cx={CX} cy={CY} r={8} fill="#374151" stroke="white" strokeWidth="2" />

        {/* Speed value + unit */}
        <text
          x={CX} y={CY + 32}
          textAnchor="middle" fontSize="30" fontWeight="bold"
          fill={speedColor(speed)}
        >
          {speed}
          <tspan fontSize="14" fill="#6b7280"> km/h</tspan>
        </text>
      </svg>

      {/* Labels below SVG */}
      <p className="text-base font-bold text-gray-700 dark:text-gray-300 mt-1">
        {isEn ? "Wagon Speed" : "ワゴン推進力"}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {isEn ? "Team Average" : "平均スコア"}: {teamAverage.toFixed(2)} / 5.00
      </p>
    </div>
  );
}
