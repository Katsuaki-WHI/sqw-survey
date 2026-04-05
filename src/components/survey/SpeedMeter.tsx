"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";

interface SpeedMeterProps {
  speed: number;
  teamAverage: number;
}

const SIZE = 300;
const CX = SIZE / 2;
const CY = 185;
const RADIUS = 95;
const STROKE = 16;

const BG_IMAGE = "/images/speedometer-bg.png";

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

/** SVG fallback gauge arcs — shown when background image is not available */
function SvgGaugeArcs({ speed }: { speed: number }) {
  const segments = [
    { from: 0, to: 50, color: "#fecaca", active: "#dc2626" },
    { from: 50, to: 100, color: "#fed7aa", active: "#ea580c" },
    { from: 100, to: 150, color: "#fef08a", active: "#ca8a04" },
    { from: 150, to: 200, color: "#bbf7d0", active: "#16a34a" },
  ];

  return (
    <>
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
    </>
  );
}

/** Tick marks and number labels — always rendered (on top of image or SVG arcs) */
function GaugeTicks() {
  // Major ticks every 20km with labels at 0,50,100,150,200
  const majorTicks = Array.from({ length: 11 }, (_, i) => i * 20); // 0,20,40,...,200
  const labelTicks = [0, 50, 100, 150, 200];
  // Minor ticks every 10km (excluding major tick positions)
  const minorTicks = Array.from({ length: 21 }, (_, i) => i * 10).filter((v) => v % 20 !== 0); // 10,30,50(skip),...

  return (
    <>
      {/* Major ticks (20km intervals) */}
      {majorTicks.map((v) => {
        const angle = speedToAngle(v);
        const outer = polarToXY(angle, RADIUS + STROKE / 2 + 3);
        const inner = polarToXY(angle, RADIUS + STROKE / 2 - 6);
        return (
          <line key={`M${v}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#6b7280" strokeWidth="1.5" />
        );
      })}

      {/* Minor ticks (10km intervals) */}
      {minorTicks.map((v) => {
        const angle = speedToAngle(v);
        const outer = polarToXY(angle, RADIUS + STROKE / 2 + 1);
        const inner = polarToXY(angle, RADIUS + STROKE / 2 - 3);
        return (
          <line key={`m${v}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth="1" />
        );
      })}

      {/* Number labels */}
      {labelTicks.map((v) => {
        const angle = speedToAngle(v);
        const pos = polarToXY(angle, RADIUS + STROKE / 2 + 34);
        return (
          <text key={`L${v}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="#1f2937">
            {v}
          </text>
        );
      })}
    </>
  );
}

export default function SpeedMeter({ speed }: SpeedMeterProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);

  const needleAngle = speedToAngle(speed);
  const needleTip = polarToXY(needleAngle, RADIUS - 6);
  const needleBase1 = polarToXY(needleAngle + Math.PI / 2, 4);
  const needleBase2 = polarToXY(needleAngle - Math.PI / 2, 4);

  const SVG_H = 225;
  // Background image area: covers the gauge region
  const imgTop = CY - RADIUS - STROKE / 2 - 18;
  const imgH = RADIUS + STROKE / 2 + 18;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE} ${SVG_H}`} width={SIZE} className="max-w-full h-auto">
        {/* Title label */}
        <text
          x={CX} y={20}
          textAnchor="middle" fontSize="14" fontWeight="bold"
          fill="#374151"
        >
          {isEn ? "Wagon Speed" : "ワゴン推進力"}
        </text>

        {/* Background image (hidden until loaded, replaces SVG arcs) */}
        {!bgError && (
          <image
            href={BG_IMAGE}
            x={(SIZE - SIZE * 0.9) / 2} y={imgTop}
            width={SIZE * 0.9} height={imgH}
            preserveAspectRatio="xMidYMid meet"
            opacity={bgLoaded ? 1 : 0}
            onLoad={() => setBgLoaded(true)}
            onError={() => setBgError(true)}
          />
        )}

        {/* SVG gauge arcs fallback — shown when image is not loaded */}
        {!bgLoaded && <SvgGaugeArcs speed={speed} />}

        {/* Tick marks and number labels — always visible */}
        <GaugeTicks />

        {/* Needle (always rendered on top) */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${CX},${CY} ${needleBase2.x},${needleBase2.y}`}
          fill={speedColor(speed)}
          stroke={speedColor(speed)}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Center cap */}
        <circle cx={CX} cy={CY} r={7} fill="#374151" stroke="white" strokeWidth="2" />

        {/* Speed value */}
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
