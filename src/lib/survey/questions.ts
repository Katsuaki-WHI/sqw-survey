export type QuestionCategory =
  | "landscape"      // 景色 - ミッション・ビジョン・バリュー
  | "road"           // 道筋 - 戦略
  | "rope"           // ロープ - リーダーシップ・コミュニケーション
  | "tire"           // タイヤ - 仕組み（既成概念）
  | "body"           // 押す人の体 - 能力・意欲
  | "attitude"       // 押す人の態度 - 風土・文化
  | "cargo"          // 積荷 - リソース・強みの認識
  | "diversity"      // 多様性 - ダイバーシティ
  | "happiness"      // 幸福度
  | "management";    // 経営陣への信頼（組織質問）

export type QuestionType = "scale" | "freetext";

export interface Question {
  id: number;
  text: string;
  textEn: string;
  category: QuestionCategory;
  type: QuestionType;
  wagonPart: string;
  categoryLabel: string;
}

// 5段階評価のラベル
export const SCALE_LABELS = [
  { value: 5, label: "非常にそう思う", labelEn: "Strongly Agree" },
  { value: 4, label: "そう思う", labelEn: "Agree" },
  { value: 3, label: "どちらとも言えない", labelEn: "Neither Agree nor Disagree" },
  { value: 2, label: "そう思わない", labelEn: "Disagree" },
  { value: 1, label: "全くそう思わない", labelEn: "Strongly Disagree" },
] as const;

// 20問バージョン：チーム質問16問 + 組織質問5問 + 自由記述5問
export const QUESTIONS: Question[] = [
  // === チーム質問（Q1-Q16）：5段階評価 ===
  // 景色（ミッション・ビジョン・バリュー）
  {
    id: 1,
    text: "あなたのチームは、お客様に喜ばれる価値を提供できていると思いますか？",
    textEn: "Is your team able to provide value that pleases customers?",
    category: "landscape",
    type: "scale",
    wagonPart: "景色",
    categoryLabel: "ミッション・ビジョン・バリュー",
  },
  {
    id: 2,
    text: "あなたのチームでは、チームの目的や目標が共有されていると思いますか？",
    textEn: "Does your team share its goals within the team?",
    category: "landscape",
    type: "scale",
    wagonPart: "景色",
    categoryLabel: "ミッション・ビジョン・バリュー",
  },
  // 道筋（戦略）
  {
    id: 3,
    text: "あなたのチームには、チームの生産性を高めてくれる戦略があると思いますか？",
    textEn: "Does your team have a strategy to increase the driving force of the team?",
    category: "road",
    type: "scale",
    wagonPart: "道筋",
    categoryLabel: "戦略",
  },
  // ロープ（リーダーシップ・コミュニケーション）
  {
    id: 4,
    text: "あなたの直属の上司は、適切なタイミングで指導・アドバイスや相談にのってくれますか？",
    textEn: "Does your direct boss give guidance, approval, and advice at suitable times?",
    category: "rope",
    type: "scale",
    wagonPart: "ロープ",
    categoryLabel: "リーダーシップ・コミュニケーション",
  },
  {
    id: 5,
    text: "あなたは、チームで自分が何を期待されているのかを理解していますか？",
    textEn: "Do you know what is expected of you in your team?",
    category: "rope",
    type: "scale",
    wagonPart: "ロープ",
    categoryLabel: "リーダーシップ・コミュニケーション",
  },
  // タイヤ（仕組み・既成概念）
  {
    id: 6,
    text: "あなたのチームでは、仕事に必要な情報やノウハウがきちんと伝達・共有されていると思いますか？",
    textEn: "Are necessary information and know-how for work transmitted and shared within the team?",
    category: "tire",
    type: "scale",
    wagonPart: "タイヤ",
    categoryLabel: "仕組み（既成概念）",
  },
  {
    id: 7,
    text: "あなたのチームでは、前例にとらわれずに新しいことに挑戦することに積極的だと思いますか？",
    textEn: "Is your team proactive in taking new ways without being bound to previous methods?",
    category: "tire",
    type: "scale",
    wagonPart: "タイヤ",
    categoryLabel: "仕組み（既成概念）",
  },
  // 押す人の体（能力・意欲）
  {
    id: 8,
    text: "あなたのチームでは、メンバーが自分の能力を高めることに積極的だと思いますか？",
    textEn: "Is your team proactive in trying to improve their abilities?",
    category: "body",
    type: "scale",
    wagonPart: "押す人の体",
    categoryLabel: "能力・意欲",
  },
  {
    id: 9,
    text: "あなたは、毎日仕事で自分が得意なことをする機会がありますか？",
    textEn: "Do you have the opportunity to do what you do best every day?",
    category: "body",
    type: "scale",
    wagonPart: "押す人の体",
    categoryLabel: "能力・意欲",
  },
  // 押す人の態度（風土・文化）
  {
    id: 10,
    text: "あなたのチームでは、必要なときにいつでも協力しあって仕事をすることができていると思いますか？",
    textEn: "Do your team members work together cooperatively when necessary?",
    category: "attitude",
    type: "scale",
    wagonPart: "押す人の態度",
    categoryLabel: "風土・文化",
  },
  {
    id: 11,
    text: "あなたは、この一週間のうちに、良い仕事をしたと認められたり、褒められたりしましたか？",
    textEn: "Have you received recognition or praise for doing good work in the last seven days?",
    category: "attitude",
    type: "scale",
    wagonPart: "押す人の態度",
    categoryLabel: "風土・文化",
  },
  // 積荷（リソース・強みの認識）
  {
    id: 12,
    text: "あなたのチームでは、自分の意見が尊重されていると思いますか？",
    textEn: "Do your opinions seem to count in your team?",
    category: "cargo",
    type: "scale",
    wagonPart: "積荷",
    categoryLabel: "リソース・強みの認識",
  },
  {
    id: 13,
    text: "あなたのチームでは、お互いに自分たちの強みや弱みを理解していると思いますか？",
    textEn: "Do your team members know their strengths and weaknesses?",
    category: "cargo",
    type: "scale",
    wagonPart: "積荷",
    categoryLabel: "リソース・強みの認識",
  },
  // 多様性（ダイバーシティ）
  {
    id: 14,
    text: "あなたのチームでは、性別や年齢に関係なく、本人の考えや適性が活かされていると思いますか？",
    textEn: "Is your team able to make use of each member's aptitude regardless of gender or age?",
    category: "diversity",
    type: "scale",
    wagonPart: "多様性",
    categoryLabel: "ダイバーシティ",
  },
  {
    id: 15,
    text: "あなたのチームでは、衝突を恐れずに異なる意見を言ったり聴いてもらえたりしていると思いますか？",
    textEn: "Is your team able to express opinions without worrying about conflicts?",
    category: "diversity",
    type: "scale",
    wagonPart: "多様性",
    categoryLabel: "ダイバーシティ",
  },
  // 幸福度
  {
    id: 16,
    text: "あなたは、今いるチームで働いていて幸せですか？",
    textEn: "Do you feel happy working with your team?",
    category: "happiness",
    type: "scale",
    wagonPart: "幸福度",
    categoryLabel: "チームの幸福度",
  },

  // === 組織質問（Q17-Q21）：5段階評価 ===
  {
    id: 17,
    text: "あなたは、会社はお客様に喜ばれる製品・成果を提供できていると思いますか？",
    textEn: "Do you think your company provides value that pleases customers?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    categoryLabel: "経営陣への信頼",
  },
  {
    id: 18,
    text: "あなたの会社では、会社の目的や目標が共有されていると思いますか？",
    textEn: "Do you think your company shares its goals within the organization?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    categoryLabel: "経営陣への信頼",
  },
  {
    id: 19,
    text: "あなたの会社の経営陣は、会社の方針と一致した言動を取っていると思いますか？",
    textEn: "Do you think management behaves consistently with the company's policy?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    categoryLabel: "経営陣への信頼",
  },
  {
    id: 20,
    text: "あなたの会社には、会社の目標達成に向けた戦略があると思いますか？",
    textEn: "Do you think your company has a strategy to achieve its goals?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    categoryLabel: "経営陣への信頼",
  },
  {
    id: 21,
    text: "あなたは、会社の経営陣を信頼していますか？",
    textEn: "Do you trust the company's management team?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    categoryLabel: "経営陣への信頼",
  },

  // === 自由記述（Q22-Q26） ===
  {
    id: 22,
    text: "今の会社の好きなところ、誇りに思うところは？",
    textEn: "What do you like or feel proud of about your company?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    categoryLabel: "自由記述",
  },
  {
    id: 23,
    text: "今の会社の課題や残念に思うところは？",
    textEn: "What challenges or disappointments do you see in your company?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    categoryLabel: "自由記述",
  },
  {
    id: 24,
    text: "あなたの直属の上司の強みと感じるところは？",
    textEn: "What do you see as your direct supervisor's strengths?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    categoryLabel: "自由記述",
  },
  {
    id: 25,
    text: "あなたの直属の上司に期待すること、要望は？",
    textEn: "What do you expect or request from your direct supervisor?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    categoryLabel: "自由記述",
  },
  {
    id: 26,
    text: "最後に一言（会社への要望・提案・アドバイスなど）",
    textEn: "Any final words (requests, suggestions, or advice for the company)?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    categoryLabel: "自由記述",
  },
];

// チーム質問のみ（ワゴン推進力計算用）
export const TEAM_QUESTIONS = QUESTIONS.filter(
  (q) => q.type === "scale" && q.category !== "management"
);

// 組織質問のみ
export const ORG_QUESTIONS = QUESTIONS.filter(
  (q) => q.type === "scale" && q.category === "management"
);

// 自由記述のみ
export const FREETEXT_QUESTIONS = QUESTIONS.filter(
  (q) => q.type === "freetext"
);

// カテゴリごとの質問グループ
export const CATEGORY_CONFIG: Record<
  QuestionCategory,
  { label: string; wagonPart: string; questionIds: number[] }
> = {
  landscape:   { label: "ミッション・ビジョン・バリュー", wagonPart: "景色", questionIds: [1, 2] },
  road:        { label: "戦略", wagonPart: "道筋", questionIds: [3] },
  rope:        { label: "リーダーシップ・コミュニケーション", wagonPart: "ロープ", questionIds: [4, 5] },
  tire:        { label: "仕組み（既成概念）", wagonPart: "タイヤ", questionIds: [6, 7] },
  body:        { label: "能力・意欲", wagonPart: "押す人の体", questionIds: [8, 9] },
  attitude:    { label: "風土・文化", wagonPart: "押す人の態度", questionIds: [10, 11] },
  cargo:       { label: "リソース・強みの認識", wagonPart: "積荷", questionIds: [12, 13] },
  diversity:   { label: "ダイバーシティ", wagonPart: "多様性", questionIds: [14, 15] },
  happiness:   { label: "チームの幸福度", wagonPart: "幸福度", questionIds: [16] },
  management:  { label: "経営陣への信頼", wagonPart: "経営", questionIds: [17, 18, 19, 20, 21] },
};
