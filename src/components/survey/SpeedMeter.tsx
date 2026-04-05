"use client";

import { useLocale } from "@/lib/i18n/context";

interface SpeedMeterProps {
  speed: number;
  teamAverage: number;
}

const SIZE = 300;
const CX = SIZE / 2;
// Gauge center pushed down to make room for title above
const CY = 185;
const RADIUS = 95;
const STROKE = 16;

function speedToAngle(speed: number): number {
  const clamped = Math.max(0, Math.min(200, speed));
  return Math.PI - (clamped / 200) * Math.PI;
}

function polarToXY(angle: number, r: number): { x: number; y: number } {
  return { x: CX + r * Math.cos(angle), y: CY - r * Math.sin(angle) };
}

function speedColor(speed: number): string {
  if (speed >= 150) return "#16a34a";
  if (speed >= 100) return "#ca8a04";
  if (speed >= 50) return "#ea580c";
  return "#dc2626";
}

function arcPath(startAngle: number, endAngle: number, r: number): string {
  const start = polarToXY(startAngle, r);
  const end = polarToXY(endAngle, r);
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function SpeedMeter({ speed }: SpeedMeterProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const needleAngle = speedToAngle(speed);
  const needleTip = polarToXY(needleAngle, RADIUS - 6);
  const needleBase1 = polarToXY(needleAngle + Math.PI / 2, 4);
  const needleBase2 = polarToXY(needleAngle - Math.PI / 2, 4);

  const segments = [
    { from: 0, to: 50, color: "#fecaca", active: "#dc2626" },
    { from: 50, to: 100, color: "#fed7aa", active: "#ea580c" },
    { from: 100, to: 150, color: "#fef08a", active: "#ca8a04" },
    { from: 150, to: 200, color: "#bbf7d0", active: "#16a34a" },
  ];

  const ticks = [0, 50, 100, 150, 200];
  const minorTicks = [25, 75, 125, 175];

  // Title y=20, gauge top edge = CY - RADIUS - STROKE/2 = 185-95-8 = 82
  // Gap between title bottom (~33) and gauge top (82) = 49px — plenty of room
  // Speed text y = CY+26 = 211, SVG_H = 225
  const SVG_H = 225;

  return (
    <div className="flex flex-col items-center">
      {/* To swap gauge background: place image at public/images/speedometer-bg.png */}
      <svg viewBox={`0 0 ${SIZE} ${SVG_H}`} width={SIZE} className="max-w-full h-auto">
        {/* Title label — well above the gauge arc */}
        <text
          x={CX} y={20}
          textAnchor="middle" fontSize="14" fontWeight="bold"
          fill="#374151"
        >
          {isEn ? "Wagon Speed" : "ワゴン推進力"}
        </text>

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

        {/* Active arc */}
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

        {/* Major ticks + labels */}
        {ticks.map((v) => {
          const angle = speedToAngle(v);
          const outer = polarToXY(angle, RADIUS + STROKE / 2 + 2);
          const inner = polarToXY(angle, RADIUS + STROKE / 2 - 5);
          const label = polarToXY(angle, RADIUS + STROKE / 2 + 15);
          return (
            <g key={v}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth="1.5" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
                {v}
              </text>
            </g>
          );
        })}

        {/* Minor ticks */}
        {minorTicks.map((v) => {
          const angle = speedToAngle(v);
          const outer = polarToXY(angle, RADIUS + STROKE / 2 + 1);
          const inner = polarToXY(angle, RADIUS + STROKE / 2 - 3);
          return (
            <line key={v} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#d1d5db" strokeWidth="1" />
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
        <circle cx={CX} cy={CY} r={7} fill="#374151" stroke="white" strokeWidth="2" />

        {/* Speed value — below the needle pivot, inside the flat bottom of the half-circle */}
        <text
          x={CX} y={CY + 26}
          textAnchor="middle" fontSize="26" fontWeight="bold"
          fill={speedColor(speed)}
        >
          {speed}
          <tspan fontSize="13" fill="#6b7280"> km/h</tspan>
        </text>
      </svg>
    </div>
  );
}
