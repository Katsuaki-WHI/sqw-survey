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
export type SurveyVersion = "26" | "40";

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
  /** true = 40問版のみ表示 */
  v40Only?: boolean;
}

export interface SurveyConfig {
  version: SurveyVersion;
  includeManagementTrust: boolean;
  qualitativeQuestions: string[];
}

// 5段階評価のラベル
export const SCALE_LABELS = [
  { value: 5, label: "非常にそう思う", labelEn: "Strongly Agree" },
  { value: 4, label: "そう思う", labelEn: "Agree" },
  { value: 3, label: "どちらとも言えない", labelEn: "Neither Agree nor Disagree" },
  { value: 2, label: "そう思わない", labelEn: "Disagree" },
  { value: 1, label: "全くそう思わない", labelEn: "Strongly Disagree" },
] as const;

// ==============================
// 26問版の設問（Q1-Q26）
// ==============================
const BASE_26_QUESTIONS: Question[] = [
  // ①景色（ミッション・ビジョン・バリュー）3問
  { id: 1, text: "あなたのチームは、お客様に喜ばれる価値を提供できていると思いますか？", textEn: "Is your team able to provide value that pleases customers?", category: "landscape", type: "scale", wagonPart: "景色", wagonPartEn: "Landscape", categoryLabel: "ミッション・ビジョン・バリュー", categoryLabelEn: "Mission, Vision & Values", q40Correlation: 0.469 },
  { id: 2, text: "あなたは、チームの一員であることに誇りを感じていますか？", textEn: "Do you feel proud to be a member of your team?", category: "landscape", type: "scale", wagonPart: "景色", wagonPartEn: "Landscape", categoryLabel: "ミッション・ビジョン・バリュー", categoryLabelEn: "Mission, Vision & Values", q40Correlation: 0.756 },
  { id: 3, text: "会社のミッション（経営理念や存在意義）は、自分の仕事が価値のあるものだと感じさせてくれますか？", textEn: "Does the company's mission make you feel that your work is valuable?", category: "landscape", type: "scale", wagonPart: "景色", wagonPartEn: "Landscape", categoryLabel: "ミッション・ビジョン・バリュー", categoryLabelEn: "Mission, Vision & Values", q40Correlation: 0.611 },

  // ②道筋（戦略）2問
  { id: 4, text: "あなたは、チームの戦略（チーム方針など）を支持していますか？", textEn: "Do you support your team's strategy and policies?", category: "road", type: "scale", wagonPart: "道筋", wagonPartEn: "Road", categoryLabel: "戦略", categoryLabelEn: "Strategy", q40Correlation: 0.61 },
  { id: 5, text: "あなたのチームの戦略（チーム方針など）は、チームのパフォーマンスを高めてくれていますか？", textEn: "Does your team's strategy help improve the team's performance?", category: "road", type: "scale", wagonPart: "道筋", wagonPartEn: "Road", categoryLabel: "戦略", categoryLabelEn: "Strategy", q40Correlation: 0.608 },

  // ③ロープ（リーダーシップ・コミュニケーション）3問
  { id: 6, text: "チームのリーダーは、適切なタイミングで指導・承認・アドバイスをしてくれますか？", textEn: "Does your team leader provide guidance, approval, and advice at suitable times?", category: "rope", type: "scale", wagonPart: "ロープ", wagonPartEn: "Rope", categoryLabel: "リーダーシップ・コミュニケーション", categoryLabelEn: "Leadership & Communication", q40Correlation: 0.567 },
  { id: 7, text: "チームのリーダーは、明確な目標を示してくれますか？", textEn: "Does your team leader set clear goals for the team?", category: "rope", type: "scale", wagonPart: "ロープ", wagonPartEn: "Rope", categoryLabel: "リーダーシップ・コミュニケーション", categoryLabelEn: "Leadership & Communication", q40Correlation: 0.544 },
  { id: 8, text: "あなたは、チームで自分が何を期待されているのかを理解していますか？", textEn: "Do you know what is expected of you in your team?", category: "rope", type: "scale", wagonPart: "ロープ", wagonPartEn: "Rope", categoryLabel: "リーダーシップ・コミュニケーション", categoryLabelEn: "Leadership & Communication", q40Correlation: 0.54 },

  // ④タイヤ（仕組み・既成概念）3問
  { id: 9, text: "あなたのチームは、仕事を上手く行うために必要な材料や道具（ITシステム含む）を与えられていますか？", textEn: "Does your team have the materials and tools (including IT systems) needed to do their work well?", category: "tire", type: "scale", wagonPart: "タイヤ", wagonPartEn: "Tire", categoryLabel: "仕組み（既成概念）", categoryLabelEn: "Systems & Mindset", q40Correlation: 0.487 },
  { id: 10, text: "あなたのチームは、仕事の成果や結果を適切に評価されていますか？", textEn: "Is your team's work performance and results evaluated fairly?", category: "tire", type: "scale", wagonPart: "タイヤ", wagonPartEn: "Tire", categoryLabel: "仕組み（既成概念）", categoryLabelEn: "Systems & Mindset", q40Correlation: 0.562 },
  { id: 11, text: "あなたのチームでは、前例にとらわれずに新しいやり方をとることに積極的ですか？", textEn: "Is your team proactive in trying new approaches without being bound to previous methods?", category: "tire", type: "scale", wagonPart: "タイヤ", wagonPartEn: "Tire", categoryLabel: "仕組み（既成概念）", categoryLabelEn: "Systems & Mindset", q40Correlation: 0.511 },

  // ⑤押す人の体（能力・意欲）4問
  { id: 12, text: "この6ヶ月のうちに、あなたが成長したと周囲の誰かに言われましたか？", textEn: "In the last six months, has someone told you that you have grown?", category: "body", type: "scale", wagonPart: "押す人の体", wagonPartEn: "Body", categoryLabel: "能力・意欲", categoryLabelEn: "Capability & Motivation", q40Correlation: 0.536 },
  { id: 13, text: "あなたは、毎日仕事で自分が得意なことをする機会がありますか？", textEn: "Do you have the opportunity to do what you do best every day?", category: "body", type: "scale", wagonPart: "押す人の体", wagonPartEn: "Body", categoryLabel: "能力・意欲", categoryLabelEn: "Capability & Motivation", q40Correlation: 0.556 },
  { id: 14, text: "あなたは、この1年のうちに、仕事について学び、成長する機会がありましたか？", textEn: "In the last year, have you had opportunities to learn and grow at work?", category: "body", type: "scale", wagonPart: "押す人の体", wagonPartEn: "Body", categoryLabel: "能力・意欲", categoryLabelEn: "Capability & Motivation", q40Correlation: 0.55 },
  { id: 15, text: "あなたの成長を励ましてくれる人が職場にいますか？", textEn: "Is there someone at work who encourages your growth?", category: "body", type: "scale", wagonPart: "押す人の体", wagonPartEn: "Body", categoryLabel: "能力・意欲", categoryLabelEn: "Capability & Motivation", q40Correlation: 0.548 },

  // ⑥押す人の態度（風土・文化）4問
  { id: 16, text: "あなたは、この一週間のうちに、良い仕事をしたと認められたり、褒められたりしましたか？", textEn: "Have you received recognition or praise for doing good work in the last seven days?", category: "attitude", type: "scale", wagonPart: "押す人の態度", wagonPartEn: "Attitude", categoryLabel: "風土・文化", categoryLabelEn: "Culture & Ethos", q40Correlation: 0.571 },
  { id: 17, text: "職場の誰かが、あなたを一人の人間として気にかけてくれていますか？", textEn: "Does someone at work care about you as a person?", category: "attitude", type: "scale", wagonPart: "押す人の態度", wagonPartEn: "Attitude", categoryLabel: "風土・文化", categoryLabelEn: "Culture & Ethos", q40Correlation: 0.587 },
  { id: 18, text: "チームメンバーは、真剣に質の高い仕事をしようとしていますか？", textEn: "Are your team members committed to doing quality work?", category: "attitude", type: "scale", wagonPart: "押す人の態度", wagonPartEn: "Attitude", categoryLabel: "風土・文化", categoryLabelEn: "Culture & Ethos", q40Correlation: 0.551 },
  { id: 19, text: "あなたのチームは、必要なときにいつでも協力し合って仕事をしていますか？", textEn: "Does your team always cooperate and work together when needed?", category: "attitude", type: "scale", wagonPart: "押す人の態度", wagonPartEn: "Attitude", categoryLabel: "風土・文化", categoryLabelEn: "Culture & Ethos", q40Correlation: 0.568 },

  // ⑦積荷（リソース・強みの認識）3問
  { id: 20, text: "あなたのチームでは、チームの強みやリソースを活かして新しいことに挑戦していますか？", textEn: "Does your team leverage its strengths and resources to take on new challenges?", category: "cargo", type: "scale", wagonPart: "積荷", wagonPartEn: "Cargo", categoryLabel: "リソース・強みの認識", categoryLabelEn: "Resources & Strengths", q40Correlation: 0.367 },
  { id: 21, text: "あなたのチームでは、自分の意見が尊重されていると思いますか？", textEn: "Do your opinions seem to count in your team?", category: "cargo", type: "scale", wagonPart: "積荷", wagonPartEn: "Cargo", categoryLabel: "リソース・強みの認識", categoryLabelEn: "Resources & Strengths", q40Correlation: 0.605 },
  { id: 22, text: "あなたのチームでは、お互いに自分たちの強みや弱みを理解していると思いますか？", textEn: "Do your team members know each other's strengths and weaknesses?", category: "cargo", type: "scale", wagonPart: "積荷", wagonPartEn: "Cargo", categoryLabel: "リソース・強みの認識", categoryLabelEn: "Resources & Strengths", q40Correlation: 0.563 },

  // ⑧多様性（ダイバーシティ）3問
  { id: 23, text: "あなたのチームでは、性別や年齢に関係なく、本人の考えや適性が活かされていると思いますか？", textEn: "Is your team able to make use of each member's aptitude regardless of gender or age?", category: "diversity", type: "scale", wagonPart: "多様性", wagonPartEn: "Diversity", categoryLabel: "ダイバーシティ", categoryLabelEn: "Diversity", q40Correlation: 0.557 },
  { id: 24, text: "あなたのチームでは、衝突を恐れずに異なる意見を言ったり聴いてもらえたりしていると思いますか？", textEn: "Is your team able to express different opinions without worrying about conflicts?", category: "diversity", type: "scale", wagonPart: "多様性", wagonPartEn: "Diversity", categoryLabel: "ダイバーシティ", categoryLabelEn: "Diversity", q40Correlation: 0.53 },
  { id: 25, text: "あなたは、職場に親しい友人と呼べる人がいますか？", textEn: "Do you have a close friend at work?", category: "diversity", type: "scale", wagonPart: "多様性", wagonPartEn: "Diversity", categoryLabel: "ダイバーシティ", categoryLabelEn: "Diversity", q40Correlation: 0.448 },

  // ⑨幸福度（1問）
  { id: 26, text: "あなたは、今いるチームで働いていて幸せですか？", textEn: "Do you feel happy working with your team?", category: "happiness", type: "scale", wagonPart: "幸福度", wagonPartEn: "Happiness", categoryLabel: "チームの幸福度", categoryLabelEn: "Team Happiness" },
];

// ==============================
// 40問版で追加される14問（ID: 101-114）
// ==============================
const EXTRA_40_QUESTIONS: Question[] = [
  { id: 101, text: "あなたのチームは、チームの目指す姿（目的やビジョンなど）が共有されていますか？", textEn: "Does your team share its goal within the team? (purposes, visions, etc.)", category: "landscape", type: "scale", wagonPart: "景色", wagonPartEn: "Landscape", categoryLabel: "ミッション・ビジョン・バリュー", categoryLabelEn: "Mission, Vision & Values", v40Only: true },
  { id: 102, text: "チームのリーダーは、チームの目指す姿と一致した言動を取っていますか？（※リーダー自身は自己評価）", textEn: "Does the team leader behave in a manner consistent with the team goal? (*Leaders please evaluate yourselves)", category: "landscape", type: "scale", wagonPart: "景色", wagonPartEn: "Landscape", categoryLabel: "ミッション・ビジョン・バリュー", categoryLabelEn: "Mission, Vision & Values", v40Only: true },
  { id: 103, text: "あなたのチームには、顧客（市場・社内も含む）の期待に応えられる戦略がありますか？", textEn: "Does your team have a strategy that meets the expectations of customers?", category: "road", type: "scale", wagonPart: "道筋", wagonPartEn: "Road", categoryLabel: "戦略", categoryLabelEn: "Strategy", v40Only: true },
  { id: 104, text: "あなたのチームは、市場や環境の変化に対応し、戦略を素早く修正することができますか？", textEn: "Is your team able to promptly make changes to its strategy depending on changes in the market?", category: "road", type: "scale", wagonPart: "道筋", wagonPartEn: "Road", categoryLabel: "戦略", categoryLabelEn: "Strategy", v40Only: true },
  { id: 105, text: "チームのリーダーは、顧客（市場・社内など）が求めていることをよく理解できていますか？（※リーダー自身は自己評価）", textEn: "Does the team leader understand very well the demands of the customers? (*Leaders please evaluate yourselves)", category: "rope", type: "scale", wagonPart: "ロープ", wagonPartEn: "Rope", categoryLabel: "リーダーシップ・コミュニケーション", categoryLabelEn: "Leadership & Communication", v40Only: true },
  { id: 106, text: "チームのリーダーは、決断力がありますか？（※リーダー自身は自己評価）", textEn: "Does the team leader have the capability of making decisions? (*Leaders please evaluate yourselves)", category: "rope", type: "scale", wagonPart: "ロープ", wagonPartEn: "Rope", categoryLabel: "リーダーシップ・コミュニケーション", categoryLabelEn: "Leadership & Communication", v40Only: true },
  { id: 107, text: "あなたのチームは、仕事に必要な情報やノウハウを伝達・共有していますか？", textEn: "Are necessary information and know-how for work transmitted and shared within the team?", category: "tire", type: "scale", wagonPart: "タイヤ", wagonPartEn: "Tire", categoryLabel: "仕組み（既成概念）", categoryLabelEn: "Systems & Mindset", v40Only: true },
  { id: 108, text: "あなたのチームは、枠やルールにとらわれず自律的に行動できる範囲が広いですか？", textEn: "Does your team have a wide range of autonomy without being tied down by boundaries and rules?", category: "tire", type: "scale", wagonPart: "タイヤ", wagonPartEn: "Tire", categoryLabel: "仕組み（既成概念）", categoryLabelEn: "Systems & Mindset", v40Only: true },
  { id: 109, text: "あなたのチームは、自分の能力を高めることに積極的ですか？", textEn: "Is your team proactive in trying to improve their abilities?", category: "body", type: "scale", wagonPart: "押す人の体", wagonPartEn: "Body", categoryLabel: "能力・意欲", categoryLabelEn: "Capability & Motivation", v40Only: true },
  { id: 110, text: "あなたのチームは、役割に対して適した人材（知識・能力・経験・可能性）が配置されていますか？", textEn: "Does your team have personnel who are suitable for their roles?", category: "body", type: "scale", wagonPart: "押す人の体", wagonPartEn: "Body", categoryLabel: "能力・意欲", categoryLabelEn: "Capability & Motivation", v40Only: true },
  { id: 111, text: "あなたは、積極的に社外の情報を取りに行っていますか？", textEn: "Do you proactively try to gather information from outside of the company?", category: "cargo", type: "scale", wagonPart: "積荷", wagonPartEn: "Cargo", categoryLabel: "リソース・強みの認識", categoryLabelEn: "Resources & Strengths", v40Only: true },
  { id: 112, text: "あなたのチームは、必要に応じてチーム外の人材やリソースを活用していますか？", textEn: "Does your team make use of personnel or resources outside of the team when necessary?", category: "cargo", type: "scale", wagonPart: "積荷", wagonPartEn: "Cargo", categoryLabel: "リソース・強みの認識", categoryLabelEn: "Resources & Strengths", v40Only: true },
  { id: 113, text: "あなたのチームは、各々の能力や特性を発揮して仕事をしていますか？", textEn: "Does your team work in a way that allows each member to display their capabilities and specialties?", category: "diversity", type: "scale", wagonPart: "多様性", wagonPartEn: "Diversity", categoryLabel: "ダイバーシティ", categoryLabelEn: "Diversity", v40Only: true },
  { id: 114, text: "あなたのチームは、互いの強みを活かして新たな価値を生み出そうとしていますか？", textEn: "Does your team try to leverage one another's strengths to create new value?", category: "diversity", type: "scale", wagonPart: "多様性", wagonPartEn: "Diversity", categoryLabel: "ダイバーシティ", categoryLabelEn: "Diversity", v40Only: true },
];

// ==============================
// 経営陣への信頼（5問・オプション）
// ==============================
const MANAGEMENT_QUESTIONS: Question[] = [
  { id: 27, text: "あなたの会社は、お客様に喜ばれる製品・成果を提供できていると思いますか？", textEn: "Do you think your company provides products and results that please customers?", category: "management", type: "scale", wagonPart: "経営", wagonPartEn: "Management", categoryLabel: "経営陣への信頼", categoryLabelEn: "Trust in Management" },
  { id: 28, text: "あなたの会社では、会社の目的や目標が共有されていると思いますか？", textEn: "Do you think your company shares its purpose and goals within the organization?", category: "management", type: "scale", wagonPart: "経営", wagonPartEn: "Management", categoryLabel: "経営陣への信頼", categoryLabelEn: "Trust in Management" },
  { id: 29, text: "あなたの会社の経営陣は、会社の方針と一致した言動を取っていると思いますか？", textEn: "Do you think your company's management team behaves in a manner consistent with company policy?", category: "management", type: "scale", wagonPart: "経営", wagonPartEn: "Management", categoryLabel: "経営陣への信頼", categoryLabelEn: "Trust in Management" },
  { id: 30, text: "あなたの会社には、会社の目標達成に向けた戦略があると思いますか？", textEn: "Do you think your company has a strategy for achieving its goals?", category: "management", type: "scale", wagonPart: "経営", wagonPartEn: "Management", categoryLabel: "経営陣への信頼", categoryLabelEn: "Trust in Management" },
  { id: 31, text: "あなたは、会社の経営陣を信頼していますか？", textEn: "Do you trust your company's management team?", category: "management", type: "scale", wagonPart: "経営", wagonPartEn: "Management", categoryLabel: "経営陣への信頼", categoryLabelEn: "Trust in Management" },
];

// ==============================
// 自由記述（既定5問）
// ==============================
const DEFAULT_FREETEXT: Question[] = [
  { id: 32, text: "今の会社の好きなところ、誇りに思うところは？", textEn: "What do you like or feel proud of about your company?", category: "management", type: "freetext", wagonPart: "", wagonPartEn: "", categoryLabel: "自由記述", categoryLabelEn: "Free Text" },
  { id: 33, text: "今の会社の課題や残念に思うところは？", textEn: "What challenges or disappointments do you see in your company?", category: "management", type: "freetext", wagonPart: "", wagonPartEn: "", categoryLabel: "自由記述", categoryLabelEn: "Free Text" },
  { id: 34, text: "あなたの直属の上司の強みと感じるところは？", textEn: "What do you see as your direct supervisor's strengths?", category: "management", type: "freetext", wagonPart: "", wagonPartEn: "", categoryLabel: "自由記述", categoryLabelEn: "Free Text" },
  { id: 35, text: "あなたの直属の上司に期待すること、要望は？", textEn: "What do you expect or request from your direct supervisor?", category: "management", type: "freetext", wagonPart: "", wagonPartEn: "", categoryLabel: "自由記述", categoryLabelEn: "Free Text" },
  { id: 36, text: "最後に一言（会社への要望・提案・アドバイスなど）", textEn: "Any final words (requests, suggestions, or advice for the company)?", category: "management", type: "freetext", wagonPart: "", wagonPartEn: "", categoryLabel: "自由記述", categoryLabelEn: "Free Text" },
];

// ==============================
// Legacy: full QUESTIONS array (26版 + management + freetext) for backward compatibility
// ==============================
export const QUESTIONS: Question[] = [
  ...BASE_26_QUESTIONS,
  ...MANAGEMENT_QUESTIONS,
  ...DEFAULT_FREETEXT,
];

/**
 * Build the question list based on survey config.
 * - version='26': 26 team questions
 * - version='40': 26 + 14 extra = 40 team questions (Q15 moves to attitude category)
 * - includeManagementTrust: append 5 management questions
 * - Freetext is NOT included (handled separately via qualitative_questions)
 */
export function getQuestionsForConfig(config: SurveyConfig): Question[] {
  let questions: Question[];

  if (config.version === "40") {
    // 40-question version: base 26 + 14 extra, sorted by category order
    const all = [...BASE_26_QUESTIONS, ...EXTRA_40_QUESTIONS];
    // In 40-version, Q15 (id:15) moves from body to attitude
    questions = all.map((q) =>
      q.id === 15
        ? { ...q, category: "attitude" as QuestionCategory, categoryLabel: "風土・文化", categoryLabelEn: "Culture & Ethos", wagonPart: "押す人の態度", wagonPartEn: "Attitude" }
        : q
    );
    // Sort by category order then id
    const catOrder: QuestionCategory[] = ["landscape", "road", "rope", "tire", "body", "attitude", "cargo", "diversity", "happiness"];
    questions.sort((a, b) => {
      const ci = catOrder.indexOf(a.category);
      const cj = catOrder.indexOf(b.category);
      if (ci !== cj) return ci - cj;
      return a.id - b.id;
    });
  } else {
    questions = [...BASE_26_QUESTIONS];
  }

  if (config.includeManagementTrust) {
    questions = [...questions, ...MANAGEMENT_QUESTIONS];
  }

  return questions;
}

/**
 * Get the CATEGORY_CONFIG for a specific version.
 * In 40-version, question IDs are extended per category and Q15 moves to attitude.
 */
export function getCategoryConfigForVersion(version: SurveyVersion) {
  if (version === "40") {
    return {
      landscape:  { label: "ミッション・ビジョン・バリュー", labelEn: "Mission, Vision & Values", wagonPart: "景色", wagonPartEn: "Landscape", questionIds: [1, 2, 3, 101, 102] },
      road:       { label: "戦略", labelEn: "Strategy", wagonPart: "道筋", wagonPartEn: "Road", questionIds: [4, 5, 103, 104] },
      rope:       { label: "リーダーシップ・コミュニケーション", labelEn: "Leadership & Communication", wagonPart: "ロープ", wagonPartEn: "Rope", questionIds: [6, 7, 8, 105, 106] },
      tire:       { label: "仕組み（既成概念）", labelEn: "Systems & Mindset", wagonPart: "タイヤ", wagonPartEn: "Tire", questionIds: [9, 10, 11, 107, 108] },
      body:       { label: "能力・意欲", labelEn: "Capability & Motivation", wagonPart: "押す人の体", wagonPartEn: "Body", questionIds: [12, 13, 14, 109, 110] },
      attitude:   { label: "風土・文化", labelEn: "Culture & Ethos", wagonPart: "押す人の態度", wagonPartEn: "Attitude", questionIds: [15, 16, 17, 18, 19] },
      cargo:      { label: "リソース・強みの認識", labelEn: "Resources & Strengths", wagonPart: "積荷", wagonPartEn: "Cargo", questionIds: [20, 21, 22, 111, 112] },
      diversity:  { label: "ダイバーシティ", labelEn: "Diversity", wagonPart: "多様性", wagonPartEn: "Diversity", questionIds: [23, 24, 25, 113, 114] },
      happiness:  { label: "チームの幸福度", labelEn: "Team Happiness", wagonPart: "幸福度", wagonPartEn: "Happiness", questionIds: [26] },
      management: { label: "経営陣への信頼", labelEn: "Trust in Management", wagonPart: "経営", wagonPartEn: "Management", questionIds: [27, 28, 29, 30, 31] },
    };
  }

  // 26-version (default)
  return CATEGORY_CONFIG;
}

// Backward-compatible exports
export const TEAM_QUESTIONS = BASE_26_QUESTIONS;
export const ORG_QUESTIONS = MANAGEMENT_QUESTIONS;
export const FREETEXT_QUESTIONS = DEFAULT_FREETEXT;

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
