// 新バージョン設問変更履歴（2026/4/9〜）
// ID3: Q05テキスト変更（Gallupリスク排除・WHI表現）
// ID8: Q14テキスト変更（Gallupリスク排除）
// ID9: Q16昇華（AIツール活用問いに変更）
// ID12: Q22廃止→Q21に変更
// ID13: Q23テキスト変更（好き×得意・Gallupリスク排除）
// ID14: Q24廃止→Q28テキスト変更（Gallupリスク排除）
// ID16: Q26廃止→Q27テキスト変更（Gallupリスク排除）
// ID17: Q29テキスト変更（Gallupリスク排除）
// ID18: Q32カテゴリ移動cargo→attitude＋テキスト変更
// ID20: Q34テキスト変更
// ID23: Q36復活採用（EXTRA_40から昇格）
// ID25: Q38復活採用・Q39廃止（EXTRA_40から昇格）

// 40問版→26問版の設問マッピング
export const QUESTION_MAPPING_40_TO_26 = [
  // ミッション・ビジョン・バリュー
  { q40: 1,  q26: 1,  category40: "mission", category26: "mission" },
  { q40: 4,  q26: 2,  category40: "mission", category26: "mission" },
  { q40: 5,  q26: 3,  category40: "mission", category26: "mission" },
  // 戦略
  { q40: 7,  q26: 4,  category40: "strategy", category26: "strategy" },
  { q40: 8,  q26: 5,  category40: "strategy", category26: "strategy" },
  // リーダーシップ
  { q40: 11, q26: 6,  category40: "leadership", category26: "leadership" },
  { q40: 12, q26: 7,  category40: "leadership", category26: "leadership" },
  { q40: 14, q26: 8,  category40: "leadership", category26: "leadership" },
  // 仕組み
  { q40: 17, q26: 9,  category40: "structure", category26: "structure" },
  { q40: 18, q26: 10, category40: "structure", category26: "structure" },
  { q40: 19, q26: 11, category40: "structure", category26: "structure" },
  // 能力・意欲
  { q40: 21, q26: 12, category40: "capability", category26: "capability" },
  { q40: 23, q26: 13, category40: "capability", category26: "capability",
    note: "テキスト変更：「好き×得意」表現に改訂" },
  { q40: 28, q26: 14, category40: "culture", category26: "capability",
    note: "カテゴリ移動＋テキスト変更：40問版は風土・文化、26問版は能力・意欲" },
  // 風土・文化
  { q40: 25, q26: 15, category40: "culture", category26: "culture" },
  { q40: 27, q26: 16, category40: "culture", category26: "culture",
    note: "テキスト変更：「尊重」表現に改訂" },
  { q40: 29, q26: 17, category40: "culture", category26: "culture",
    note: "テキスト変更：「質の高い仕事を追求」に改訂" },
  { q40: 32, q26: 18, category40: "resource", category26: "culture",
    note: "カテゴリ移動＋テキスト変更：40問版はリソース、26問版は風土・文化（意見尊重）" },
  // リソース・強みの認識
  { q40: 33, q26: 19, category40: "resource", category26: "resource" },
  { q40: 34, q26: 20, category40: "resource", category26: "resource",
    note: "テキスト変更：チーム外活用に改訂" },
  // ID21は新問（AIツール活用）のため40問版マッピングなし
  // ダイバーシティ
  { q40: 35, q26: 22, category40: "diversity", category26: "diversity" },
  { q40: 36, q26: 23, category40: "diversity", category26: "diversity",
    note: "EXTRA_40から26問版に昇格" },
  { q40: 37, q26: 24, category40: "diversity", category26: "diversity" },
  { q40: 38, q26: 25, category40: "diversity", category26: "diversity",
    note: "EXTRA_40から26問版に昇格。Q39（親しい友人）は廃止" },
  // 幸福度
  { q40: 40, q26: 26, category40: "happiness", category26: "happiness" },
] as const;

// 40問版にのみ存在する14問（26問版には対応なし）
export const QUESTIONS_40_ONLY = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] as const;

// Q30の特記事項（旧Q30は廃止、ID114として40問版のみに残存）
export const Q30_MAPPING_NOTE = {
  q40: 30,
  q26: null, // 26問版からは廃止
  legacyQuestion: "あなたは、新しいことにチャレンジすることが好きですか？",
  newQuestion: null, // 26問版ID21に置き換え（AIツール活用問い）
  treatment: "deprecated_in_v26",
  // 過去12万人分は旧問いで代替。新規データは新問いで蓄積。
  // benchmark利用時はlegacy_data_flag=trueのデータを区別して扱う
} as const;

// Q28のカテゴリ移動の特記事項
export const Q28_CATEGORY_NOTE = {
  q40: 28,
  q26: 14,
  category40: "culture",    // 40問版：風土・文化
  category26: "capability", // 26問版：能力・意欲
  // ベンチマーク集計時はバージョンごとに別カテゴリとして扱う
} as const;

// Q32のカテゴリ移動の特記事項（2026/4/9追加）
export const Q32_CATEGORY_NOTE = {
  q40: 32,
  q26: 18,
  category40: "resource",   // 40問版：リソース・強みの認識
  category26: "culture",    // 26問版：風土・文化（意見尊重）
  note: "「自分の意見が尊重されている」は風土・文化の要素として再配置",
} as const;
