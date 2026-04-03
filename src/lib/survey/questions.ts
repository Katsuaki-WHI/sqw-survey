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
  wagonPartEn: string;
  categoryLabel: string;
  categoryLabelEn: string;
  /** Q40（幸福度）との相関係数（実測値）。改善インパクト計算に使用 */
  q40Correlation?: number;
}

// 5段階評価のラベル
export const SCALE_LABELS = [
  { value: 5, label: "非常にそう思う", labelEn: "Strongly Agree" },
  { value: 4, label: "そう思う", labelEn: "Agree" },
  { value: 3, label: "どちらとも言えない", labelEn: "Neither Agree nor Disagree" },
  { value: 2, label: "そう思わない", labelEn: "Disagree" },
  { value: 1, label: "全くそう思わない", labelEn: "Strongly Disagree" },
] as const;

// 確定26問バージョン：チーム質問26問 + 組織質問5問 + 自由記述5問
export const QUESTIONS: Question[] = [
  // === チーム質問（Q1-Q26）：5段階評価 ===

  // ①景色（ミッション・ビジョン・バリュー）3問
  {
    id: 1,
    text: "あなたのチームは、お客様に喜ばれる価値を提供できていると思いますか？",
    textEn: "Is your team able to provide value that pleases customers?",
    category: "landscape",
    type: "scale",
    wagonPart: "景色",
    wagonPartEn: "Landscape",
    categoryLabel: "ミッション・ビジョン・バリュー",
    categoryLabelEn: "Mission, Vision & Values",
    q40Correlation: 0.469,
  },
  {
    id: 2,
    text: "あなたは、チームの一員であることに誇りを感じていますか？",
    textEn: "Do you feel proud to be a member of your team?",
    category: "landscape",
    type: "scale",
    wagonPart: "景色",
    wagonPartEn: "Landscape",
    categoryLabel: "ミッション・ビジョン・バリュー",
    categoryLabelEn: "Mission, Vision & Values",
    q40Correlation: 0.756,
  },
  {
    id: 3,
    text: "会社のミッション（経営理念や存在意義）は、自分の仕事が価値のあるものだと感じさせてくれますか？",
    textEn: "Does the company's mission make you feel that your work is valuable?",
    category: "landscape",
    type: "scale",
    wagonPart: "景色",
    wagonPartEn: "Landscape",
    categoryLabel: "ミッション・ビジョン・バリュー",
    categoryLabelEn: "Mission, Vision & Values",
    q40Correlation: 0.611,
  },

  // ②道筋（戦略）2問
  {
    id: 4,
    text: "あなたは、チームの戦略（チーム方針など）を支持していますか？",
    textEn: "Do you support your team's strategy and policies?",
    category: "road",
    type: "scale",
    wagonPart: "道筋",
    wagonPartEn: "Road",
    categoryLabel: "戦略",
    categoryLabelEn: "Strategy",
    q40Correlation: 0.61,
  },
  {
    id: 5,
    text: "あなたのチームの戦略（チーム方針など）は、チームのパフォーマンスを高めてくれていますか？",
    textEn: "Does your team's strategy help improve the team's performance?",
    category: "road",
    type: "scale",
    wagonPart: "道筋",
    wagonPartEn: "Road",
    categoryLabel: "戦略",
    categoryLabelEn: "Strategy",
    q40Correlation: 0.608,
  },

  // ③ロープ（リーダーシップ・コミュニケーション）3問
  {
    id: 6,
    text: "チームのリーダーは、適切なタイミングで指導・承認・アドバイスをしてくれますか？",
    textEn: "Does your team leader provide guidance, approval, and advice at suitable times?",
    category: "rope",
    type: "scale",
    wagonPart: "ロープ",
    wagonPartEn: "Rope",
    categoryLabel: "リーダーシップ・コミュニケーション",
    categoryLabelEn: "Leadership & Communication",
    q40Correlation: 0.567,
  },
  {
    id: 7,
    text: "チームのリーダーは、明確な目標を示してくれますか？",
    textEn: "Does your team leader set clear goals for the team?",
    category: "rope",
    type: "scale",
    wagonPart: "ロープ",
    wagonPartEn: "Rope",
    categoryLabel: "リーダーシップ・コミュニケーション",
    categoryLabelEn: "Leadership & Communication",
    q40Correlation: 0.544,
  },
  {
    id: 8,
    text: "あなたは、チームで自分が何を期待されているのかを理解していますか？",
    textEn: "Do you know what is expected of you in your team?",
    category: "rope",
    type: "scale",
    wagonPart: "ロープ",
    wagonPartEn: "Rope",
    categoryLabel: "リーダーシップ・コミュニケーション",
    categoryLabelEn: "Leadership & Communication",
    q40Correlation: 0.54,
  },

  // ④タイヤ（仕組み・既成概念）3問
  {
    id: 9,
    text: "あなたのチームは、仕事を上手く行うために必要な材料や道具（ITシステム含む）を与えられていますか？",
    textEn: "Does your team have the materials and tools (including IT systems) needed to do their work well?",
    category: "tire",
    type: "scale",
    wagonPart: "タイヤ",
    wagonPartEn: "Tire",
    categoryLabel: "仕組み（既成概念）",
    categoryLabelEn: "Systems & Mindset",
    q40Correlation: 0.487,
  },
  {
    id: 10,
    text: "あなたのチームは、仕事の成果や結果を適切に評価されていますか？",
    textEn: "Is your team's work performance and results evaluated fairly?",
    category: "tire",
    type: "scale",
    wagonPart: "タイヤ",
    wagonPartEn: "Tire",
    categoryLabel: "仕組み（既成概念）",
    categoryLabelEn: "Systems & Mindset",
    q40Correlation: 0.562,
  },
  {
    id: 11,
    text: "あなたのチームでは、前例にとらわれずに新しいやり方をとることに積極的ですか？",
    textEn: "Is your team proactive in trying new approaches without being bound to previous methods?",
    category: "tire",
    type: "scale",
    wagonPart: "タイヤ",
    wagonPartEn: "Tire",
    categoryLabel: "仕組み（既成概念）",
    categoryLabelEn: "Systems & Mindset",
    q40Correlation: 0.511,
  },

  // ⑤押す人の体（能力・意欲）4問
  {
    id: 12,
    text: "この6ヶ月のうちに、あなたが成長したと周囲の誰かに言われましたか？",
    textEn: "In the last six months, has someone told you that you have grown?",
    category: "body",
    type: "scale",
    wagonPart: "押す人の体",
    wagonPartEn: "Body",
    categoryLabel: "能力・意欲",
    categoryLabelEn: "Capability & Motivation",
    q40Correlation: 0.536,
  },
  {
    id: 13,
    text: "あなたは、毎日仕事で自分が得意なことをする機会がありますか？",
    textEn: "Do you have the opportunity to do what you do best every day?",
    category: "body",
    type: "scale",
    wagonPart: "押す人の体",
    wagonPartEn: "Body",
    categoryLabel: "能力・意欲",
    categoryLabelEn: "Capability & Motivation",
    q40Correlation: 0.556,
  },
  {
    id: 14,
    text: "あなたは、この1年のうちに、仕事について学び、成長する機会がありましたか？",
    textEn: "In the last year, have you had opportunities to learn and grow at work?",
    category: "body",
    type: "scale",
    wagonPart: "押す人の体",
    wagonPartEn: "Body",
    categoryLabel: "能力・意欲",
    categoryLabelEn: "Capability & Motivation",
    q40Correlation: 0.55,
  },
  {
    id: 15,
    text: "あなたの成長を励ましてくれる人が職場にいますか？",
    textEn: "Is there someone at work who encourages your growth?",
    category: "body",
    type: "scale",
    wagonPart: "押す人の体",
    wagonPartEn: "Body",
    categoryLabel: "能力・意欲",
    categoryLabelEn: "Capability & Motivation",
    q40Correlation: 0.548,
  },

  // ⑥押す人の顔（風土・文化）4問
  {
    id: 16,
    text: "あなたは、この一週間のうちに、良い仕事をしたと認められたり、褒められたりしましたか？",
    textEn: "Have you received recognition or praise for doing good work in the last seven days?",
    category: "attitude",
    type: "scale",
    wagonPart: "押す人の態度",
    wagonPartEn: "Attitude",
    categoryLabel: "風土・文化",
    categoryLabelEn: "Culture & Ethos",
    q40Correlation: 0.571,
  },
  {
    id: 17,
    text: "職場の誰かが、あなたを一人の人間として気にかけてくれていますか？",
    textEn: "Does someone at work care about you as a person?",
    category: "attitude",
    type: "scale",
    wagonPart: "押す人の態度",
    wagonPartEn: "Attitude",
    categoryLabel: "風土・文化",
    categoryLabelEn: "Culture & Ethos",
    q40Correlation: 0.587,
  },
  {
    id: 18,
    text: "チームメンバーは、真剣に質の高い仕事をしようとしていますか？",
    textEn: "Are your team members committed to doing quality work?",
    category: "attitude",
    type: "scale",
    wagonPart: "押す人の態度",
    wagonPartEn: "Attitude",
    categoryLabel: "風土・文化",
    categoryLabelEn: "Culture & Ethos",
    q40Correlation: 0.551,
  },
  {
    id: 19,
    text: "あなたのチームは、必要なときにいつでも協力し合って仕事をしていますか？",
    textEn: "Does your team always cooperate and work together when needed?",
    category: "attitude",
    type: "scale",
    wagonPart: "押す人の態度",
    wagonPartEn: "Attitude",
    categoryLabel: "風土・文化",
    categoryLabelEn: "Culture & Ethos",
    q40Correlation: 0.568,
  },

  // ⑦積荷（リソース・強みの認識）3問
  {
    id: 20,
    text: "あなたのチームでは、チームの強みやリソースを活かして新しいことに挑戦していますか？",
    textEn: "Does your team leverage its strengths and resources to take on new challenges?",
    category: "cargo",
    type: "scale",
    wagonPart: "積荷",
    wagonPartEn: "Cargo",
    categoryLabel: "リソース・強みの認識",
    categoryLabelEn: "Resources & Strengths",
    q40Correlation: 0.367,
  },
  {
    id: 21,
    text: "あなたのチームでは、自分の意見が尊重されていると思いますか？",
    textEn: "Do your opinions seem to count in your team?",
    category: "cargo",
    type: "scale",
    wagonPart: "積荷",
    wagonPartEn: "Cargo",
    categoryLabel: "リソース・強みの認識",
    categoryLabelEn: "Resources & Strengths",
    q40Correlation: 0.605,
  },
  {
    id: 22,
    text: "あなたのチームでは、お互いに自分たちの強みや弱みを理解していると思いますか？",
    textEn: "Do your team members know each other's strengths and weaknesses?",
    category: "cargo",
    type: "scale",
    wagonPart: "積荷",
    wagonPartEn: "Cargo",
    categoryLabel: "リソース・強みの認識",
    categoryLabelEn: "Resources & Strengths",
    q40Correlation: 0.563,
  },

  // ⑧多様性（ダイバーシティ）3問
  {
    id: 23,
    text: "あなたのチームでは、性別や年齢に関係なく、本人の考えや適性が活かされていると思いますか？",
    textEn: "Is your team able to make use of each member's aptitude regardless of gender or age?",
    category: "diversity",
    type: "scale",
    wagonPart: "多様性",
    wagonPartEn: "Diversity",
    categoryLabel: "ダイバーシティ",
    categoryLabelEn: "Diversity",
    q40Correlation: 0.557,
  },
  {
    id: 24,
    text: "あなたのチームでは、衝突を恐れずに異なる意見を言ったり聴いてもらえたりしていると思いますか？",
    textEn: "Is your team able to express different opinions without worrying about conflicts?",
    category: "diversity",
    type: "scale",
    wagonPart: "多様性",
    wagonPartEn: "Diversity",
    categoryLabel: "ダイバーシティ",
    categoryLabelEn: "Diversity",
    q40Correlation: 0.53,
  },
  {
    id: 25,
    text: "あなたは、職場に親しい友人と呼べる人がいますか？",
    textEn: "Do you have a close friend at work?",
    category: "diversity",
    type: "scale",
    wagonPart: "多様性",
    wagonPartEn: "Diversity",
    categoryLabel: "ダイバーシティ",
    categoryLabelEn: "Diversity",
    q40Correlation: 0.448,
  },

  // ⑨幸福度（1問）
  {
    id: 26,
    text: "あなたは、今いるチームで働いていて幸せですか？",
    textEn: "Do you feel happy working with your team?",
    category: "happiness",
    type: "scale",
    wagonPart: "幸福度",
    wagonPartEn: "Happiness",
    categoryLabel: "チームの幸福度",
    categoryLabelEn: "Team Happiness",
  },

  // === 組織質問（Q27-Q31）：5段階評価 ===
  {
    id: 27,
    text: "あなたは、会社はお客様に喜ばれる製品・成果を提供できていると思いますか？",
    textEn: "Do you think your company provides value that pleases customers?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    wagonPartEn: "Management",
    categoryLabel: "経営陣への信頼",
    categoryLabelEn: "Trust in Management",
  },
  {
    id: 28,
    text: "あなたの会社では、会社の目的や目標が共有されていると思いますか？",
    textEn: "Do you think your company shares its goals within the organization?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    wagonPartEn: "Management",
    categoryLabel: "経営陣への信頼",
    categoryLabelEn: "Trust in Management",
  },
  {
    id: 29,
    text: "あなたの会社の経営陣は、会社の方針と一致した言動を取っていると思いますか？",
    textEn: "Do you think management behaves consistently with the company's policy?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    wagonPartEn: "Management",
    categoryLabel: "経営陣への信頼",
    categoryLabelEn: "Trust in Management",
  },
  {
    id: 30,
    text: "あなたの会社には、会社の目標達成に向けた戦略があると思いますか？",
    textEn: "Do you think your company has a strategy to achieve its goals?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    wagonPartEn: "Management",
    categoryLabel: "経営陣への信頼",
    categoryLabelEn: "Trust in Management",
  },
  {
    id: 31,
    text: "あなたは、会社の経営陣を信頼していますか？",
    textEn: "Do you trust the company's management team?",
    category: "management",
    type: "scale",
    wagonPart: "経営",
    wagonPartEn: "Management",
    categoryLabel: "経営陣への信頼",
    categoryLabelEn: "Trust in Management",
  },

  // === 自由記述（Q32-Q36） ===
  {
    id: 32,
    text: "今の会社の好きなところ、誇りに思うところは？",
    textEn: "What do you like or feel proud of about your company?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    wagonPartEn: "",
    categoryLabel: "自由記述",
    categoryLabelEn: "Free Text",
  },
  {
    id: 33,
    text: "今の会社の課題や残念に思うところは？",
    textEn: "What challenges or disappointments do you see in your company?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    wagonPartEn: "",
    categoryLabel: "自由記述",
    categoryLabelEn: "Free Text",
  },
  {
    id: 34,
    text: "あなたの直属の上司の強みと感じるところは？",
    textEn: "What do you see as your direct supervisor's strengths?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    wagonPartEn: "",
    categoryLabel: "自由記述",
    categoryLabelEn: "Free Text",
  },
  {
    id: 35,
    text: "あなたの直属の上司に期待すること、要望は？",
    textEn: "What do you expect or request from your direct supervisor?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    wagonPartEn: "",
    categoryLabel: "自由記述",
    categoryLabelEn: "Free Text",
  },
  {
    id: 36,
    text: "最後に一言（会社への要望・提案・アドバイスなど）",
    textEn: "Any final words (requests, suggestions, or advice for the company)?",
    category: "management",
    type: "freetext",
    wagonPart: "",
    wagonPartEn: "",
    categoryLabel: "自由記述",
    categoryLabelEn: "Free Text",
  },
];

// チーム質問のみ（ワゴン推進力計算用：Q1-Q26の26問）
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
  { label: string; labelEn: string; wagonPart: string; wagonPartEn: string; questionIds: number[] }
> = {
  landscape:   { label: "ミッション・ビジョン・バリュー", labelEn: "Mission, Vision & Values", wagonPart: "景色", wagonPartEn: "Landscape", questionIds: [1, 2, 3] },
  road:        { label: "戦略", labelEn: "Strategy", wagonPart: "道筋", wagonPartEn: "Road", questionIds: [4, 5] },
  rope:        { label: "リーダーシップ・コミュニケーション", labelEn: "Leadership & Communication", wagonPart: "ロープ", wagonPartEn: "Rope", questionIds: [6, 7, 8] },
  tire:        { label: "仕組み（既成概念）", labelEn: "Systems & Mindset", wagonPart: "タイヤ", wagonPartEn: "Tire", questionIds: [9, 10, 11] },
  body:        { label: "能力・意欲", labelEn: "Capability & Motivation", wagonPart: "押す人の体", wagonPartEn: "Body", questionIds: [12, 13, 14, 15] },
  attitude:    { label: "風土・文化", labelEn: "Culture & Ethos", wagonPart: "押す人の態度", wagonPartEn: "Attitude", questionIds: [16, 17, 18, 19] },
  cargo:       { label: "リソース・強みの認識", labelEn: "Resources & Strengths", wagonPart: "積荷", wagonPartEn: "Cargo", questionIds: [20, 21, 22] },
  diversity:   { label: "ダイバーシティ", labelEn: "Diversity", wagonPart: "多様性", wagonPartEn: "Diversity", questionIds: [23, 24, 25] },
  happiness:   { label: "チームの幸福度", labelEn: "Team Happiness", wagonPart: "幸福度", wagonPartEn: "Happiness", questionIds: [26] },
  management:  { label: "経営陣への信頼", labelEn: "Trust in Management", wagonPart: "経営", wagonPartEn: "Management", questionIds: [27, 28, 29, 30, 31] },
};
