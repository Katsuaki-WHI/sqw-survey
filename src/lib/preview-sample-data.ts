/**
 * 開発レビュー用サンプルデータ（実データ）
 * /admin/preview ページで使用
 *
 * チーム：CRIEN1 / invite_code: UZwKVbER
 * team_id: 89bb1e53-f812-4846-973f-cb5a8634223c
 * 回答者：4名（ちゃ・Jelly・かつ・じゅんいち）
 */

// ============================================================
// メンバー定義
// ============================================================
export interface PreviewMember {
  name: string;
  nameEn: string;
  role: "leader" | "member";
  memberToken: string;
  scores: Record<string, { avg: number; level: string }>;
}

function level(avg: number): string {
  if (avg >= 4.5) return "excellent";
  if (avg >= 3.75) return "good";
  if (avg >= 3.0) return "average";
  if (avg >= 2.0) return "poor";
  return "critical";
}

function makeScores(raw: Record<string, number>): Record<string, { avg: number; level: string }> {
  const result: Record<string, { avg: number; level: string }> = {};
  for (const [k, v] of Object.entries(raw)) {
    result[k] = { avg: v, level: level(v) };
  }
  return result;
}

export const PREVIEW_MEMBERS: PreviewMember[] = [
  {
    name: "ちゃ",
    nameEn: "Cha",
    role: "member",
    memberToken: "vWrPI5CRCJao4cryhKRQxTQ3",
    scores: makeScores({
      landscape: 5.00, road: 5.00, rope: 4.33, tire: 3.67,
      body: 4.00, attitude: 4.00, cargo: 4.67, diversity: 4.33, happiness: 4.00,
    }),
  },
  {
    name: "かつ",
    nameEn: "Katsu",
    role: "leader",
    memberToken: "cKDrLTPlfxX4WcDGKVaSbAbY",
    scores: makeScores({
      landscape: 5.00, road: 3.50, rope: 3.33, tire: 3.33,
      body: 3.50, attitude: 3.75, cargo: 4.00, diversity: 4.00, happiness: 3.00,
    }),
  },
  {
    name: "Jelly",
    nameEn: "Jelly",
    role: "member",
    memberToken: "GMqyp4T-s7lwKvh4nNDJIOqE",
    scores: makeScores({
      landscape: 4.00, road: 4.00, rope: 3.67, tire: 4.33,
      body: 3.50, attitude: 2.75, cargo: 4.00, diversity: 3.67, happiness: 3.00,
    }),
  },
  {
    name: "じゅんいち",
    nameEn: "Junichi",
    role: "member",
    memberToken: "8SY9awQEavtkihazUD47qNnN",
    scores: makeScores({
      landscape: 4.33, road: 4.00, rope: 3.33, tire: 2.67,
      body: 3.75, attitude: 3.25, cargo: 3.67, diversity: 4.00, happiness: 4.00,
    }),
  },
];

// ============================================================
// チーム平均スコア（4名平均）
// ============================================================
export const SAMPLE_TEAM_SCORES: Record<string, { avg: number; level: string }> = makeScores({
  landscape: 4.58,  // (5+5+4+4.33)/4
  road: 4.13,       // (5+3.5+4+4)/4
  rope: 3.67,       // (4.33+3.33+3.67+3.33)/4
  tire: 3.50,       // (3.67+3.33+4.33+2.67)/4
  body: 3.69,       // (4+3.5+3.5+3.75)/4
  attitude: 3.44,   // (4+3.75+2.75+3.25)/4
  cargo: 4.09,      // (4.67+4+4+3.67)/4
  diversity: 4.00,  // (4.33+4+3.67+4)/4
  happiness: 3.50,  // (4+3+3+4)/4
});

// ============================================================
// チームSD（標準偏差）— カテゴリ別、設問IDに展開
// ============================================================
const CATEGORY_SDS: Record<string, number> = {
  landscape: 0.43,
  road: 0.50,
  rope: 0.41,
  tire: 0.60,
  body: 0.21,
  attitude: 0.48,
  cargo: 0.36,
  diversity: 0.23,
  happiness: 0.50,
};

const CAT_QUESTION_IDS: Record<string, number[]> = {
  landscape: [1, 2, 3],
  road: [4, 5],
  rope: [6, 7, 8],
  tire: [9, 10, 11],
  body: [12, 13, 14],
  attitude: [15, 16, 17, 18],
  cargo: [19, 20, 21],
  diversity: [22, 23, 24, 25],
  happiness: [26],
};

export const SAMPLE_TEAM_SDS: Record<number, number> = {};
for (const [cat, qids] of Object.entries(CAT_QUESTION_IDS)) {
  const sd = CATEGORY_SDS[cat] ?? 0;
  for (const qid of qids) {
    SAMPLE_TEAM_SDS[qid] = sd;
  }
}

// ============================================================
// チーム設問別平均スコア（カテゴリ平均を各設問に展開）
// ============================================================
export const SAMPLE_TEAM_QUESTION_SCORES: Record<number, number> = {};
for (const [cat, qids] of Object.entries(CAT_QUESTION_IDS)) {
  const avg = SAMPLE_TEAM_SCORES[cat]?.avg ?? 0;
  for (const qid of qids) {
    SAMPLE_TEAM_QUESTION_SCORES[qid] = avg;
  }
}

// ============================================================
// 定数
// ============================================================
export const SAMPLE_TEAM_NAME = "CRIEN1";
export const SAMPLE_TEAM_ID = "89bb1e53-f812-4846-973f-cb5a8634223c";
export const SAMPLE_INVITE_CODE = "UZwKVbER";
export const SAMPLE_RESPONSE_COUNT = 4;
