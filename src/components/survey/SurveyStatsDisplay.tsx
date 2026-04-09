"use client";

import { useState, useEffect } from "react";

interface SurveyStatsDisplayProps {
  type: "respondent" | "team";
  variant: "banner" | "inline";
}

// Client-side fetch for stats (avoids server action in client component)
function useStats() {
  const [stats, setStats] = useState<{ respondentDisplay: string; teamDisplay: string } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return stats;
}

export function SurveyStatsDisplay({ type, variant }: SurveyStatsDisplayProps) {
  const stats = useStats();

  if (!stats) return null;

  const value = type === "respondent" ? stats.respondentDisplay : stats.teamDisplay;

  if (variant === "inline") {
    return <span className="font-bold text-blue-600">{value}</span>;
  }

  // banner variant
  return (
    <div className="text-center">
      <span className="text-3xl font-bold text-blue-600">{value}</span>
    </div>
  );
}
