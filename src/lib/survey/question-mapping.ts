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
  { q40: 16, q26: 9,  category40: "structure", category26: "structure" },
  { q40: 17, q26: 10, category40: "structure", category26: "structure" },
  { q40: 19, q26: 11, category40: "structure", category26: "structure" },
  // 能力・意欲
  { q40: 22, q26: 12, category40: "capability", category26: "capability" },
  { q40: 23, q26: 13, category40: "capability", category26: "capability" },
  { q40: 24, q26: 14, category40: "capability", category26: "capability" },
  // ⚠️ 特例：Q28はカテゴリが40問版と26問版で異なる
  { q40: 28, q26: 15, category40: "culture", category26: "capability",
    note: "カテゴリ移動：40問版は風土・文化、26問版は能力・意欲" },
  // 風土・文化（40問版番号順に修正）
  { q40: 25, q26: 16, category40: "culture", category26: "culture" },
  { q40: 26, q26: 17, category40: "culture", category26: "culture" },
  { q40: 27, q26: 18, category40: "culture", category26: "culture" },
  { q40: 29, q26: 19, category40: "culture", category26: "culture" },
  // リソース・強みの認識
  // ⚠️ 特例：Q30は問いの内容が変更されている
  { q40: 30, q26: 20, category40: "resource", category26: "resource",
    note: "問い変更：過去12万人分は旧問い（40問版Q30）で代替。新規データは新問いで蓄積。ワゴンフレームへの直接影響低いため混在許容。legacy_data_flag必須" },
  { q40: 32, q26: 21, category40: "resource", category26: "resource" },
  { q40: 33, q26: 22, category40: "resource", category26: "resource" },
  // ダイバーシティ
  { q40: 35, q26: 23, category40: "diversity", category26: "diversity" },
  { q40: 37, q26: 24, category40: "diversity", category26: "diversity" },
  { q40: 39, q26: 25, category40: "diversity", category26: "diversity" },
  // 幸福度
  { q40: 40, q26: 26, category40: "happiness", category26: "happiness" },
] as const;

// 40問版にのみ存在する14問（26問版には対応なし）
export const QUESTIONS_40_ONLY = [2, 3, 6, 9, 10, 13, 15, 18, 20, 21, 31, 34, 36, 38] as const;

// Q30の特記事項
export const Q30_MAPPING_NOTE = {
  q40: 30,
  q26: 20,
  legacyQuestion: "あなたは、新しいことにチャレンジすることが好きですか？",
  newQuestion: "あなたのチームでは、チームの強みやリソースを活かして新しいことに挑戦していますか？",
  treatment: "legacy_data_compatible",
  // 過去12万人分は旧問いで代替。新規データは新問いで蓄積。
  // benchmark利用時はlegacy_data_flag=trueのデータを区別して扱う
} as const;

// Q28のカテゴリ移動の特記事項
export const Q28_CATEGORY_NOTE = {
  q40: 28,
  q26: 15,
  category40: "culture",    // 40問版：風土・文化
  category26: "capability", // 26問版：能力・意欲
  // ベンチマーク集計時はバージョンごとに別カテゴリとして扱う
} as const;
