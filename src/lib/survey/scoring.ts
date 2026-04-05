import { CATEGORY_CONFIG, type QuestionCategory } from "./questions";

type ScaleLevel = "excellent" | "good" | "average" | "poor" | "critical";

export const SCALE_LEVEL_LABELS: Record<ScaleLevel, { ja: string; en: string }> = {
  excellent: { ja: "大変良い", en: "Excellent" },
  good:      { ja: "良い", en: "Good" },
  average:   { ja: "普通", en: "Average" },
  poor:      { ja: "悪い", en: "Poor" },
  critical:  { ja: "とても悪い", en: "Critical" },
};

/** 平均スコアから5段階レベルを判定
 *  4.50〜5.00 → excellent（大変良い）
 *  3.75〜4.49 → good（良い）
 *  3.00〜3.74 → average（普通）
 *  2.00〜2.99 → poor（悪い）
 *  1.00〜1.99 → critical（とても悪い）
 */
export function getScaleLevel(avg: number): ScaleLevel {
  if (avg >= 4.5) return "excellent";
  if (avg >= 3.75) return "good";
  if (avg >= 3.0) return "average";
  if (avg >= 2.0) return "poor";
  return "critical";
}

/** ワゴンスピード（旧計算式）: 1.6 × 平均³ — 個人結果用 */
export function calcWagonSpeed(teamAverage: number): number {
  return Math.round(1.6 * Math.pow(teamAverage, 3) * 10) / 10;
}

/**
 * ワゴンスピード（新計算式）: エンゲージメント² × 8
 *   方向性 = Q02のチーム平均
 *   貢献意欲 = (Q13 + Q19) / 2 のチーム平均
 *   エンゲージメント = (方向性 + 貢献意欲) / 2
 *   ワゴンスピード = エンゲージメント² × 8
 *
 * @param questionAverages - questionId -> チーム平均スコア のマップ
 */
export function calcWagonSpeedFromEngagement(
  questionAverages: Record<number, number>
): number {
  const direction = questionAverages[2] ?? 1;
  const q13 = questionAverages[13] ?? 1;
  const q19 = questionAverages[19] ?? 1;
  const contribution = (q13 + q19) / 2;
  const engagement = (direction + contribution) / 2;
  return Math.round(engagement * engagement * 8 * 10) / 10;
}

/** 回答データからカテゴリ別スコアを算出 */
export function calcCategoryScores(
  answers: Record<number, number>
): Record<QuestionCategory, { avg: number; level: ScaleLevel }> {
  const result = {} as Record<QuestionCategory, { avg: number; level: ScaleLevel }>;

  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    const scores = config.questionIds
      .map((id) => answers[id])
      .filter((v): v is number => v != null);

    if (scores.length === 0) {
      result[category as QuestionCategory] = { avg: 0, level: "critical" };
    } else {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      result[category as QuestionCategory] = {
        avg: Math.round(avg * 100) / 100,
        level: getScaleLevel(avg),
      };
    }
  }

  return result;
}

/** チーム質問の全体平均を算出 */
export function calcTeamAverage(answers: Record<number, number>): number {
  const teamCategories: QuestionCategory[] = [
    "landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness",
  ];
  const scores = teamCategories.flatMap((cat) =>
    CATEGORY_CONFIG[cat].questionIds.map((id) => answers[id]).filter((v): v is number => v != null)
  );
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}
