/**
 * 開発レビュー用サンプルデータ
 * /admin/preview ページで使用
 */

export const SAMPLE_PERSONAL_SCORES: Record<string, { avg: number; level: string }> = {
  landscape: { avg: 4.2, level: "good" },
  road: { avg: 3.1, level: "average" },
  rope: { avg: 3.8, level: "good" },
  tire: { avg: 2.5, level: "poor" },
  body: { avg: 4.0, level: "good" },
  attitude: { avg: 3.3, level: "average" },
  cargo: { avg: 4.5, level: "excellent" },
  diversity: { avg: 2.8, level: "poor" },
  happiness: { avg: 3.6, level: "average" },
};

export const SAMPLE_TEAM_SCORES: Record<string, { avg: number; level: string }> = {
  landscape: { avg: 3.8, level: "good" },
  road: { avg: 3.5, level: "average" },
  rope: { avg: 3.2, level: "average" },
  tire: { avg: 3.0, level: "average" },
  body: { avg: 3.7, level: "average" },
  attitude: { avg: 3.9, level: "good" },
  cargo: { avg: 4.0, level: "good" },
  diversity: { avg: 3.5, level: "average" },
  happiness: { avg: 3.8, level: "good" },
};

export const SAMPLE_TEAM_SDS: Record<number, number> = {
  // landscape Q1-3
  1: 0.8, 2: 0.8, 3: 0.8,
  // road Q4-5
  4: 0.4, 5: 0.4,
  // rope Q6-8
  6: 1.1, 7: 1.1, 8: 1.1,
  // tire Q9-11
  9: 0.3, 10: 0.3, 11: 0.3,
  // body Q12-14
  12: 0.6, 13: 0.6, 14: 0.6,
  // attitude Q15-18
  15: 0.9, 16: 0.9, 17: 0.9, 18: 0.9,
  // cargo Q19-21
  19: 0.5, 20: 0.5, 21: 0.5,
  // diversity Q22-25
  22: 1.2, 23: 1.2, 24: 1.2, 25: 1.2,
  // happiness Q26
  26: 0.7,
};

// Question scores derived from category averages
export const SAMPLE_PERSONAL_QUESTION_SCORES: Record<number, number> = {
  1: 4.2, 2: 4.2, 3: 4.2,
  4: 3.1, 5: 3.1,
  6: 3.8, 7: 3.8, 8: 3.8,
  9: 2.5, 10: 2.5, 11: 2.5,
  12: 4.0, 13: 4.0, 14: 4.0,
  15: 3.3, 16: 3.3, 17: 3.3, 18: 3.3,
  19: 4.5, 20: 4.5, 21: 4.5,
  22: 2.8, 23: 2.8, 24: 2.8, 25: 2.8,
  26: 3.6,
};

export const SAMPLE_TEAM_QUESTION_SCORES: Record<number, number> = {
  1: 3.8, 2: 3.8, 3: 3.8,
  4: 3.5, 5: 3.5,
  6: 3.2, 7: 3.2, 8: 3.2,
  9: 3.0, 10: 3.0, 11: 3.0,
  12: 3.7, 13: 3.7, 14: 3.7,
  15: 3.9, 16: 3.9, 17: 3.9, 18: 3.9,
  19: 4.0, 20: 4.0, 21: 4.0,
  22: 3.5, 23: 3.5, 24: 3.5, 25: 3.5,
  26: 3.8,
};

export const SAMPLE_RESPONDENT_NAME = "テスト太郎";
export const SAMPLE_TEAM_NAME = "サンプルチーム";
export const SAMPLE_RESPONSE_COUNT = 5;
