/**
 * ============================================================
 * 示唆コメントマスター
 * ============================================================
 *
 * 【設計思想】
 * スコア階調の変更（5段階→10段階など）や
 * データ数字の更新に強い設計になっています。
 *
 * 【変更方法】
 *
 * ① スコア配分・階調を変更したい場合：
 *   → src/lib/survey/scoring.ts の SCORE_LEVELS を変更するだけ
 *   → このファイルのコメントは変更不要（positionで管理しているため）
 *
 * ② データ数字（受検者数・チーム数）を更新したい場合：
 *   → このファイル冒頭の DATA_STATS の数字を変更するだけ
 *   → 全コメントに自動反映される
 *
 * ③ コメント内容を改善したい場合：
 *   → 各カテゴリの position（top/high/mid/low/bottom）ごとの
 *     valueComment / ctaComment を直接編集する
 *
 * ④ 新しいカテゴリを追加したい場合：
 *   → PERSONAL_INSIGHT_COMMENTS と TEAM_INSIGHT_COMMENTS に
 *     同じ構造でカテゴリを追加する
 *
 * 【positionの意味】
 *   top:    最高レベル（スコア上位）
 *   high:   高いレベル
 *   mid:    中程度
 *   low:    低めのレベル
 *   bottom: 最も低いレベル（スコア下位）
 *
 * ============================================================
 */

// ============================================================
// データ統計（ここだけ変更すれば全コメントに反映）
// ============================================================
export const DATA_STATS = {
  totalRespondents: 117371,
  totalTeams: 9021,
  respondentsDisplay: "117,371人",
  teamsDisplay: "9,021チーム",
} as const;

// ============================================================
// 型定義
// ============================================================
export type ScorePosition = "top" | "high" | "mid" | "low" | "bottom";

export interface InsightComment {
  valueComment: string;
  valueCommentEn: string;
  ctaComment: string;
  ctaCommentEn: string;
}

export type CategoryInsightMap = Record<ScorePosition, InsightComment>;
export type InsightCommentMaster = Record<string, CategoryInsightMap>;

// ============================================================
// カテゴリラベル定義
// ============================================================
export const CATEGORY_LABELS: Record<string, { ja: string; en: string; icon: string }> = {
  landscape: { ja: "景色（目的と誇り）", en: "Landscape (Purpose & Pride)", icon: "🌅" },
  road: { ja: "道筋（戦略）", en: "Path (Strategy)", icon: "🗺️" },
  rope: { ja: "ロープ（リーダーの関わり）", en: "Rope (Leadership & Engagement)", icon: "🪢" },
  tire: { ja: "タイヤ（仕組み・既成概念）", en: "Wheels (Structure & Conventions)", icon: "⚙️" },
  body: { ja: "押す人の体（能力発揮・意欲）", en: "Body (Capability & Motivation)", icon: "💪" },
  attitude: { ja: "押す人の表情（風土・文化）", en: "Attitude (Culture & Climate)", icon: "😊" },
  cargo: { ja: "積荷（リソース・強み）", en: "Cargo (Resources & Strengths)", icon: "📦" },
  diversity: { ja: "登場人物の多彩さ（多様性）", en: "Cast of Characters (Diversity)", icon: "🌈" },
  happiness: { ja: "はたらく喜び（幸福度）", en: "Joy of Work (Happiness)", icon: "✨" },
};

// ============================================================
// 個人向け示唆コメントマスター
// ============================================================
export const PERSONAL_INSIGHT_COMMENTS: InsightCommentMaster = {
  landscape: {
    top: {
      valueComment: `景色（目的と誇り）のスコアが最高レベルです。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の95%が幸福度も高い状態にあります。あなたはこのチームで「なぜ働くか」という問いに、自分なりの答えを持っている人です。`,
      valueCommentEn: `Your Landscape (Purpose & Pride) score is at the highest level. Data from ${DATA_STATS.respondentsDisplay} shows 95% of people at this level also have high happiness. You have found your own answer to "why I work here."`,
      ctaComment: "この強みが、チームの他のメンバーにどう見えているか知っていますか？有料レポートでは、あなたの誇りがチームの中でどう機能しているかを詳しくお伝えします。",
      ctaCommentEn: "Do you know how this strength is seen by your teammates? The full report reveals how your sense of pride functions within the team.",
    },
    high: {
      valueComment: "景色（目的と誇り）のスコアが高い状態です。このスコアの方は、データでも幸福度が高い傾向があります。チームの目的や方向性に共感できていることが、あなたの働く力の源になっています。",
      valueCommentEn: "Your Landscape (Purpose & Pride) score is high. Data shows people at this level tend to have higher happiness. Your ability to resonate with the team's purpose is a source of your energy.",
      ctaComment: "あなたの目的感がさらに深まると、どんな変化が起きるか。有料レポートで具体的なアクションをお届けします。",
      ctaCommentEn: "What would change if your sense of purpose deepened further? The full report delivers specific actions.",
    },
    mid: {
      valueComment: `景色（目的と誇り）のスコアは中程度です。${DATA_STATS.respondentsDisplay}のデータでは、このカテゴリが幸福度と最も強く連動しています。「このチームで働く意味」をもう少し明確にできると、幸福度が大きく変わる可能性があります。`,
      valueCommentEn: `Your Landscape (Purpose & Pride) score is at a middle level. Data from ${DATA_STATS.respondentsDisplay} shows this category has the strongest connection to happiness. Clarifying "the meaning of working in this team" could significantly change your happiness.`,
      ctaComment: "何があれば「このチームへの誇り」が高まるか、有料レポートで一緒に考えます。",
      ctaCommentEn: "What would raise your sense of pride in this team? The full report explores this together with you.",
    },
    low: {
      valueComment: "景色（目的と誇り）のスコアが低めです。「このチームで働く意味が見えにくい」という感覚があるかもしれません。データでは、このカテゴリが低いと幸福度にも影響が出やすいことがわかっています。",
      valueCommentEn: 'Your Landscape (Purpose & Pride) score is low. You may feel that "the meaning of working in this team is unclear." Data shows this category, when low, tends to affect happiness.',
      ctaComment: "この状態が続くと何が起きるか、そして何が変われば変わるか——有料レポートで詳しくお伝えします。",
      ctaCommentEn: "What happens if this continues, and what change would make a difference — the full report tells you.",
    },
    bottom: {
      valueComment: "景色（目的と誇り）のスコアが最も低いレベルです。「なぜここで働いているのか」という問いが心の中にあるかもしれません。これは弱さではなく、あなたが本気でこの仕事に向き合っているサインです。",
      valueCommentEn: 'Your Landscape (Purpose & Pride) score is at the lowest level. You may be asking yourself "why am I working here?" This is not weakness — it\'s a sign that you care deeply about your work.',
      ctaComment: "あなたの「誇り」を取り戻すための最初の一歩を、有料レポートでお伝えします。",
      ctaCommentEn: "The full report shows you the first step to reclaiming your sense of pride.",
    },
  },

  road: {
    top: {
      valueComment: `道筋（戦略）のスコアが最高レベルです。チームの方向性を支持し、その戦略がパフォーマンスに貢献していると感じています。${DATA_STATS.respondentsDisplay}のデータでも、戦略への共感は幸福度と強く連動しています。`,
      valueCommentEn: `Your Path (Strategy) score is at the highest level. You support the team direction and feel it contributes to performance. Data from ${DATA_STATS.respondentsDisplay} confirms strategic alignment connects strongly with happiness.`,
      ctaComment: "この戦略理解が、チームの他のメンバーとどう違うか気になりますか？有料レポートでギャップを可視化します。",
      ctaCommentEn: "Curious how your strategic understanding differs from teammates? The full report visualizes those gaps.",
    },
    high: {
      valueComment: "道筋（戦略）のスコアが高い状態です。チームの戦略に共感できていることが、日々の仕事の確かさにつながっています。",
      valueCommentEn: "Your Path (Strategy) score is high. Your alignment with the team strategy creates a sense of confidence in your daily work.",
      ctaComment: "戦略への共感をさらに深めると、あなたのパフォーマンスはどう変わるか。有料レポートで確認しましょう。",
      ctaCommentEn: "How would deeper strategic alignment change your performance? Find out in the full report.",
    },
    mid: {
      valueComment: "道筋（戦略）のスコアは中程度です。チームの戦略について「なんとなく理解している」という状態かもしれません。戦略への共感が深まると、仕事のやりがいも変わります。",
      valueCommentEn: "Your Path (Strategy) score is at a middle level. You may have a vague understanding of the team strategy. Deeper alignment can change your sense of purpose.",
      ctaComment: "何があれば戦略への共感が深まるか、有料レポートで具体的に探ります。",
      ctaCommentEn: "What would deepen your strategic alignment? The full report explores this specifically.",
    },
    low: {
      valueComment: "道筋（戦略）のスコアが低めです。チームの戦略や方向性に「本当にこれでいいのか」という疑問があるかもしれません。その疑問は、あなたが仕事を真剣に考えている証です。",
      valueCommentEn: "Your Path (Strategy) score is low. You may question whether the team strategy is truly right. That questioning is a sign that you take your work seriously.",
      ctaComment: "その疑問を有料レポートで言語化し、具体的なアクションに変えましょう。",
      ctaCommentEn: "Let the full report help articulate that question and turn it into action.",
    },
    bottom: {
      valueComment: "道筋（戦略）のスコアが最も低いレベルです。チームの方向性に共感できない状態は、エネルギーの消耗につながりやすいです。あなたの感覚は正直で、大切なシグナルです。",
      valueCommentEn: "Your Path (Strategy) score is at the lowest level. Not aligning with the team direction can drain energy. Your feelings are honest and important signals.",
      ctaComment: "この状態を変えるために何が必要か、有料レポートで一緒に考えます。",
      ctaCommentEn: "The full report helps you figure out what is needed to change this situation.",
    },
  },

  rope: {
    top: {
      valueComment: "ロープ（リーダーの関わり）のスコアが最高レベルです。リーダーからの適切な指導・承認・目標提示が機能しています。このカテゴリが高い人は、チームへの貢献感も高い傾向があります。",
      valueCommentEn: "Your Rope (Leadership & Engagement) score is at the highest level. You receive appropriate guidance, recognition, and clear goals from your leader. People with high scores here tend to have a stronger sense of contribution.",
      ctaComment: "このリーダーとの関係が、あなたの強みとどうつながっているか。有料レポートで詳しく見えます。",
      ctaCommentEn: "How does your relationship with your leader connect to your strengths? The full report shows you.",
    },
    high: {
      valueComment: "ロープ（リーダーの関わり）のスコアが高い状態です。リーダーとの関係が機能していることが、あなたの仕事の安定感につながっています。",
      valueCommentEn: "Your Rope (Leadership & Engagement) score is high. Your functional relationship with your leader creates stability in your work.",
      ctaComment: "リーダーとの関係をさらに活かすためのヒントが、有料レポートにあります。",
      ctaCommentEn: "The full report has tips for leveraging your leader relationship even further.",
    },
    mid: {
      valueComment: "ロープ（リーダーの関わり）のスコアは中程度です。リーダーからの関わりに「もう少しあってほしい」という感覚があるかもしれません。",
      valueCommentEn: "Your Rope (Leadership & Engagement) score is at a middle level. You may feel you would like a bit more engagement from your leader.",
      ctaComment: "リーダーへの伝え方のヒントを、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers tips on how to communicate with your leader.",
    },
    low: {
      valueComment: "ロープ（リーダーの関わり）のスコアが低めです。「自分が正しく評価されていない」「目標が不明確」という感覚があるかもしれません。データでは、このカテゴリが低いと幸福度にも影響が出やすいことが確認されています。",
      valueCommentEn: "Your Rope (Leadership & Engagement) score is low. You may feel unrecognized or unclear about goals. Data confirms this category, when low, tends to affect happiness.",
      ctaComment: "この状況を改善するための具体的なアクションを、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers concrete actions to improve this situation.",
    },
    bottom: {
      valueComment: "ロープ（リーダーの関わり）のスコアが最も低いレベルです。リーダーとの関係に大きな課題を感じているかもしれません。一人で抱え込まず、この状況を言語化することが第一歩です。",
      valueCommentEn: "Your Rope (Leadership & Engagement) score is at the lowest level. You may feel significant challenges in your relationship with your leader. The first step is putting this situation into words.",
      ctaComment: "有料レポートで、この状況を変えるための具体的な言葉と行動をお届けします。",
      ctaCommentEn: "The full report gives you specific words and actions to change this situation.",
    },
  },

  tire: {
    top: {
      valueComment: "タイヤ（仕組み・既成概念）のスコアが最高レベルです。評価の仕組みや自律性、新しいやり方への姿勢が整っています。このカテゴリが高いチームは、変化への適応力も高い傾向があります。",
      valueCommentEn: "Your Wheels (Structure & Conventions) score is at the highest level. Evaluation systems, autonomy, and openness to new approaches are all working well. Teams with high scores here tend to adapt to change more effectively.",
      ctaComment: "この強みをさらに活かすアイデアが、有料レポートにあります。",
      ctaCommentEn: "The full report has ideas for leveraging this strength even further.",
    },
    high: {
      valueComment: "タイヤ（仕組み・既成概念）のスコアが高い状態です。仕事の仕組みが機能しており、自律的に動ける環境が整っています。",
      valueCommentEn: "Your Wheels (Structure & Conventions) score is high. The work systems are functioning well and you have an environment where you can act autonomously.",
      ctaComment: "仕組みの強みがどこから来ているか、有料レポートで深掘りします。",
      ctaCommentEn: "The full report digs deeper into where your structural strengths come from.",
    },
    mid: {
      valueComment: "タイヤ（仕組み・既成概念）のスコアは中程度です。「評価が不明確」「前例に縛られている」という感覚が部分的にあるかもしれません。",
      valueCommentEn: "Your Wheels (Structure & Conventions) score is at a middle level. You may partially feel that evaluation is unclear or that you are bound by precedent.",
      ctaComment: "どの仕組みを変えると最も効果的か、有料レポートで特定します。",
      ctaCommentEn: "The full report identifies which systems to change for maximum impact.",
    },
    low: {
      valueComment: "タイヤ（仕組み・既成概念）のスコアが低めです。「頑張っているのに正当に評価されない」「前例に縛られて動きにくい」という感覚があるかもしれません。",
      valueCommentEn: "Your Wheels (Structure & Conventions) score is low. You may feel that despite your efforts you are not being evaluated fairly, or that you are constrained by precedent.",
      ctaComment: "このフラストレーションの正体と、改善のための一歩を有料レポートでお届けします。",
      ctaCommentEn: "The full report reveals the source of this frustration and your first step toward improvement.",
    },
    bottom: {
      valueComment: "タイヤ（仕組み・既成概念）のスコアが最も低いレベルです。仕組みや慣習が大きな障壁になっている状態かもしれません。このカテゴリが低いと、どれだけ頑張っても報われない感覚につながりやすいです。",
      valueCommentEn: "Your Wheels (Structure & Conventions) score is at the lowest level. Systems and conventions may be creating major barriers. Low scores here can create a feeling that no matter how hard you try, it does not pay off.",
      ctaComment: "この状況を変えるために最も効果的なアクションを、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers the most effective actions to change this situation.",
    },
  },

  body: {
    top: {
      valueComment: `ワゴンを押す人が、適した場所で・好きな仕事で・仲間に応援されながら、力強く動いています。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方は仕事への没入感も高い傾向があります。「自分がここにいる理由」を感じながら押せている状態です。`,
      valueCommentEn: `The wagon is being pushed by someone in the right place, doing work they love, cheered on by their teammates. Data from ${DATA_STATS.respondentsDisplay} shows people at this level tend to experience greater work engagement. You're pushing with a clear sense of "why I'm here."`,
      ctaComment: "あなたの強みがチームの中でどう機能しているか、有料レポートでさらに深く見えます。",
      ctaCommentEn: "The full report shows more deeply how your strengths function within the team.",
    },
    high: {
      valueComment: "ワゴンを押す力が充実しています。適材適所で・好きと得意を活かして・応援される環境の中で動けています。この充実感が、チームのワゴンを前へ動かす力になっています。",
      valueCommentEn: "You're pushing the wagon with plenty of strength — in the right role, using your passions and strengths, in an environment where you're supported. This sense of fulfillment is what drives the team's wagon forward.",
      ctaComment: "この強みをさらに伸ばすための具体的なアクションが、有料レポートにあります。",
      ctaCommentEn: "The full report has specific actions to develop this strength further.",
    },
    mid: {
      valueComment: "ワゴンを押す力はあるのに、まだ全部は使えていない感覚があるかもしれません。「好きな仕事をもっとしたい」「適した場所で力を発揮したい」という感覚は、伸びしろのサインです。",
      valueCommentEn: `You have the strength to push the wagon, but may feel like it's not fully coming through yet. The sense of "I want to do more of what I love" or "I want to use my strengths in the right place" is a sign of potential waiting to unfold.`,
      ctaComment: "あなたの「好き×得意×貢献」がどこにあるか、有料レポートで一緒に探ります。",
      ctaCommentEn: "The full report explores where your passion × strength × contribution overlap lies.",
    },
    low: {
      valueComment: "ワゴンを押す力があるのに、それが活かされていないもどかしさがあるかもしれません。「適した場所にいない」「好きや得意が活かせていない」「応援してくれる人が少ない」という感覚があるかもしれません。",
      valueCommentEn: `You have the strength to push the wagon but may feel the frustration of it not being fully used. You may feel "I'm not in the right place," "my passions and strengths aren't being utilized," or "I don't have enough people supporting me."`,
      ctaComment: "あなたの強みを取り戻すための最初の一歩を、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers your first step toward reclaiming your strengths.",
    },
    bottom: {
      valueComment: "ワゴンを押す力がまだ眠ったままになっているかもしれません。適材適所でなく・好きや得意が活かせず・応援してくれる人もいない状態は、大きなエネルギーの消耗につながります。あなたの力は本物です。",
      valueCommentEn: "The strength to push the wagon may still be asleep. Not being in the right place, not being able to use your passions and strengths, and not having people who support you — this combination drains enormous energy. But your strength is real.",
      ctaComment: "有料レポートで、あなたの可能性を引き出すための具体的なアクションをお届けします。",
      ctaCommentEn: "The full report delivers specific actions to unlock your potential.",
    },
  },

  attitude: {
    top: {
      valueComment: `押す人の表情（風土・文化）のスコアが最高レベルです。${DATA_STATS.respondentsDisplay}のデータでは、このカテゴリのスコアが高い方の95%以上が幸福度も高い状態にあります。協力・尊重・質への姿勢が整った環境にいることは、とても恵まれた状態です。`,
      valueCommentEn: `Your Attitude (Culture & Climate) score is at the highest level. Data from ${DATA_STATS.respondentsDisplay} shows over 95% of people at this level also have high happiness. Being in an environment of collaboration, respect, and quality commitment is truly fortunate.`,
      ctaComment: "この環境をさらに強化するために、あなたにできることが有料レポートに載っています。",
      ctaCommentEn: "The full report shows what you can do to strengthen this environment further.",
    },
    high: {
      valueComment: "押す人の表情（風土・文化）のスコアが高い状態です。チームの雰囲気や文化が機能しており、協力し合える環境があります。このカテゴリは幸福度と最も強く連動するカテゴリの一つです。",
      valueCommentEn: "Your Attitude (Culture & Climate) score is high. The team atmosphere and culture are working well with a collaborative environment. This category is one of the strongest drivers of happiness.",
      ctaComment: "この風土をさらに豊かにするためのヒントが、有料レポートにあります。",
      ctaCommentEn: "The full report has tips for enriching this culture further.",
    },
    mid: {
      valueComment: "押す人の表情（風土・文化）のスコアは中程度です。「もう少し協力し合えれば」「もう少し認め合えれば」という感覚があるかもしれません。このカテゴリは幸福度に最も大きな影響を与えます。",
      valueCommentEn: 'Your Attitude (Culture & Climate) score is at a middle level. You may feel "if only we could collaborate more" or "if only we recognized each other more." This category has the greatest impact on happiness.',
      ctaComment: "風土を変えるための最も効果的な一手を、有料レポートで特定します。",
      ctaCommentEn: "The full report identifies the most effective move to change the culture.",
    },
    low: {
      valueComment: "押す人の表情（風土・文化）のスコアが低めです。データでは、このカテゴリが低いと81%のメンバーが幸福度も低い状態にあります。チームの雰囲気や関係性に課題を感じているかもしれません。",
      valueCommentEn: "Your Attitude (Culture & Climate) score is low. Data shows 81% of members with low scores here also have low happiness. You may be experiencing challenges in team atmosphere and relationships.",
      ctaComment: "この状況を変えるための具体的なアクションを、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers concrete actions to change this situation.",
    },
    bottom: {
      valueComment: `押す人の表情（風土・文化）のスコアが最も低いレベルです。データでは、このカテゴリが最低レベルのチームの93.5%が不幸な状態にあります。チームの雰囲気が今の働きにくさの大きな原因になっているかもしれません。`,
      valueCommentEn: "Your Attitude (Culture & Climate) score is at the lowest level. Data shows 93.5% of teams at the lowest level are in an unhappy state. The team atmosphere may be a major cause of your current difficulty at work.",
      ctaComment: "まず何から変えればいいか——有料レポートで最優先アクションをお届けします。",
      ctaCommentEn: "What to change first — the full report delivers your highest priority action.",
    },
  },

  cargo: {
    top: {
      valueComment: "ワゴンの積荷に、旅に必要な装備が揃っています。「仲間のことを深く知っている地図」「外の世界とつながるネットワーク」「最新のツールや知恵」——この3つが揃ったチームは、どんな状況にも対応できます。",
      valueCommentEn: `The wagon's cargo holds everything needed for the journey: a deep map of each teammate's strengths and weaknesses, a network connecting you to the outside world, and the latest tools and knowledge. A team with all three can handle any situation.`,
      ctaComment: "この強みをさらに活かすための示唆が、有料レポートにあります。",
      ctaCommentEn: "The full report has insights for leveraging this strength even further.",
    },
    high: {
      valueComment: "ワゴンの積荷が充実しています。仲間の強み弱みを理解し、外部のリソースを活用し、新しいツールや技術も取り入れられている状態です。この装備の豊かさが、旅の可能性を広げています。",
      valueCommentEn: "The wagon's cargo is well-stocked. You understand each other's strengths and weaknesses, can leverage external resources, and are incorporating new tools and technologies. This richness of equipment is expanding the possibilities of the journey.",
      ctaComment: "リソースの活用をさらに深めるためのアイデアが、有料レポートにあります。",
      ctaCommentEn: "The full report has ideas for deepening your resource utilization.",
    },
    mid: {
      valueComment: "ワゴンの積荷が、まだ十分に揃っていないかもしれません。「仲間のことをもっと知りたい」「外のネットワークをもっと活かしたい」「新しい技術をもっと取り入れたい」という感覚があるかもしれません。装備が揃うほど、旅の選択肢が広がります。",
      valueCommentEn: `The wagon's cargo may not be fully stocked yet. You may feel "I want to know my teammates better," "I want to leverage external networks more," or "I want to incorporate new technologies more." The better the equipment, the more options you have on the journey.`,
      ctaComment: "どのリソースを優先的に活用すべきか、有料レポートで特定します。",
      ctaCommentEn: "The full report identifies which resources to prioritize.",
    },
    low: {
      valueComment: "ワゴンの積荷が薄く、旅の装備が心もとない状態かもしれません。「仲間のことがよくわからない」「外の世界とのつながりが少ない」「新しいツールを活かしきれていない」という感覚があるかもしれません。",
      valueCommentEn: `The wagon's cargo may be thin, leaving the journey's equipment feeling insufficient. You may feel "I don't know my teammates well enough," "we have few connections to the outside world," or "we're not making the most of new tools."`,
      ctaComment: "この課題を解決するための具体的なアクションを、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers concrete actions to address this challenge.",
    },
    bottom: {
      valueComment: "ワゴンの積荷が、ほとんど空の状態かもしれません。仲間の強み弱みが見えず・外部とのつながりが薄く・新しい技術も活かせていない状態は、旅の行き詰まりにつながります。まず「仲間を知ること」が最初の一歩です。",
      valueCommentEn: `The wagon's cargo may be nearly empty. Not seeing each other's strengths and weaknesses, having few external connections, and not leveraging new technologies — this combination leads to a dead end on the journey. The first step is simply "getting to know your teammates."`,
      ctaComment: "まず何から手をつけるべきか——有料レポートで最優先アクションをお届けします。",
      ctaCommentEn: "Where to start — the full report delivers your highest priority action.",
    },
  },

  diversity: {
    top: {
      valueComment: `ワゴンの旅に、個性豊かな登場人物たちが集まり、それぞれが堂々と舞台に立っています。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の96.7%が幸福度も高い状態にあります。衝突を恐れずに意見をぶつけ合い、そこから新しい価値が生まれています。`,
      valueCommentEn: `Characters full of individuality have gathered for the wagon's journey, each standing boldly on the stage. Data from ${DATA_STATS.respondentsDisplay} shows 96.7% of people at this level also have high happiness. By engaging without fear of conflict, new value is being born.`,
      ctaComment: "この多様性をさらにチームの成果につなげる方法が、有料レポートにあります。",
      ctaCommentEn: "The full report shows how to connect this diversity even further to team results.",
    },
    high: {
      valueComment: "ワゴンの旅に、多彩な個性を持つ仲間たちがいます。性別・年齢に関係なく適性が活かされ、それぞれが能力を発揮しています。この多様な登場人物たちが、旅に化学反応を起こしています。",
      valueCommentEn: "The wagon's journey has companions with diverse individuality. Strengths are being utilized regardless of gender or age, and everyone is making full use of their capabilities. These diverse characters are creating chemical reactions in the journey.",
      ctaComment: "この強みをさらに深める具体的なアクションが、有料レポートにあります。",
      ctaCommentEn: "The full report has specific actions to deepen this strength.",
    },
    mid: {
      valueComment: "ワゴンの旅の登場人物たちが、まだ舞台の脇に立っているかもしれません。「もっと自分の個性を活かしたい」「もっと意見をぶつけ合えれば」という感覚があるかもしれません。それぞれが舞台に立つほど、旅は豊かになります。",
      valueCommentEn: `The characters on the wagon's journey may still be standing in the wings. You may feel "I want to express my individuality more" or "I wish we could engage more openly." The more each person steps onto the stage, the richer the journey becomes.`,
      ctaComment: "多様性をさらに活かすための具体的なヒントが、有料レポートにあります。",
      ctaCommentEn: "The full report has specific tips for better leveraging diversity.",
    },
    low: {
      valueComment: "ワゴンの旅で、自分の個性や意見を出しにくい状態かもしれません。「衝突を避けがち」「自分の特性を発揮できていない」という感覚があるかもしれません。安全に意見をぶつけ合える関係が、旅の質を大きく変えます。",
      valueCommentEn: `It may be hard to express your individuality or opinions on the wagon's journey. You may feel "we tend to avoid conflict" or "I'm not able to demonstrate my capabilities." A relationship where you can safely engage creates huge differences in the journey's quality.`,
      ctaComment: "この状況を改善するための具体的なアクションを、有料レポートでお届けします。",
      ctaCommentEn: "The full report delivers concrete actions to improve this situation.",
    },
    bottom: {
      valueComment: "ワゴンの旅で、登場人物たちが個性を発揮できていない状態かもしれません。衝突を恐れ・意見をぶつけ合えず・新しい価値が生まれにくい環境は、旅のエネルギーを大きく奪います。",
      valueCommentEn: "The characters on the wagon's journey may not be able to express their individuality. An environment where conflict is feared, opinions can't be shared, and new value is hard to create — this significantly drains the journey's energy.",
      ctaComment: "有料レポートで、あなたらしさを取り戻すための具体的なアクションをお届けします。",
      ctaCommentEn: "The full report delivers specific actions to help you reclaim your true self.",
    },
  },
};

// ============================================================
// チーム向け示唆コメントマスター
// ============================================================
export const TEAM_INSIGHT_COMMENTS: InsightCommentMaster = {
  landscape: {
    top: { valueComment: `景色（目的と誇り）のチームスコアが最高レベルです。${DATA_STATS.teamsDisplay}のデータで、このスコアのチームの幸福度平均は4.25と非常に高い状態です。チーム全員が「なぜここで働くか」に共通の答えを持っている、最も強い基盤です。`, valueCommentEn: `Your team's Landscape (Purpose & Pride) score is at the highest level. Across ${DATA_STATS.teamsDisplay}, teams at this level average 4.25 in happiness. This is the strongest foundation: every team member shares a common answer to "why we work here."`, ctaComment: "この強みをさらに活かし、チームの成果につなげる方法が有料レポートにあります。", ctaCommentEn: "The full report shows how to leverage this strength further and connect it to team results." },
    high: { valueComment: "景色（目的と誇り）のチームスコアが高い状態です。チームとしての目的意識が機能しており、メンバーの幸福度にも好影響を与えています。", valueCommentEn: "Your team's Landscape (Purpose & Pride) score is high. The team's sense of purpose is functioning well, positively affecting member happiness.", ctaComment: "この目的意識をさらに深めるための具体的なアクションが、有料レポートにあります。", ctaCommentEn: "The full report has specific actions to deepen this sense of purpose further." },
    mid: { valueComment: "景色（目的と誇り）のチームスコアは中程度です。このカテゴリはチームの幸福度と最も強く連動します。「このチームで働く意味」をメンバー全員で共有できると、チームのエネルギーが大きく変わります。", valueCommentEn: `Your team's Landscape (Purpose & Pride) score is at a middle level. This category has the strongest connection to team happiness. Sharing "the meaning of working in this team" with all members could significantly change the team's energy.`, ctaComment: "ミッション共有のための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions for sharing the mission." },
    low: { valueComment: "景色（目的と誇り）のチームスコアが低めです。データでは、このカテゴリが低いチームの幸福度平均は2.43と低い状態にあります。「チームとしての方向性が見えにくい」状態かもしれません。", valueCommentEn: `Your team's Landscape (Purpose & Pride) score is low. Data shows teams with low scores here average 2.43 in happiness. The team may be in a state where "the direction is unclear."`, ctaComment: "チームの目的を再構築するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to rebuild the team's purpose." },
    bottom: { valueComment: "景色（目的と誇り）のチームスコアが最も低いレベルです。このカテゴリが低いチームは、幸福度も成果も大きく影響を受けます。まず「このチームはなぜ存在するのか」を問い直すことが最優先です。", valueCommentEn: `Your team's Landscape (Purpose & Pride) score is at the lowest level. Teams with low scores here experience significant impact on both happiness and performance. The top priority is re-examining "why does this team exist."`, ctaComment: "有料レポートで、チームの再起動に向けた最初の一歩をお届けします。", ctaCommentEn: "The full report delivers the first step toward team renewal." },
  },
  road: {
    top: { valueComment: "道筋（戦略）のチームスコアが最高レベルです。チームの戦略への共感と、その戦略がパフォーマンスに貢献しているという実感が高い状態です。このカテゴリが高いチームは変化への対応力も高い傾向があります。", valueCommentEn: "Your team's Path (Strategy) score is at the highest level. Team members strongly support the strategy and feel it contributes to performance. Teams with high scores here tend to be more adaptable to change.", ctaComment: "この戦略力をさらに活かすための示唆が、有料レポートにあります。", ctaCommentEn: "The full report has insights for leveraging this strategic strength further." },
    high: { valueComment: "道筋（戦略）のチームスコアが高い状態です。戦略への共感がチームの推進力になっています。", valueCommentEn: "Your team's Path (Strategy) score is high. Strategic alignment is driving the team forward.", ctaComment: "戦略をさらに浸透させるためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to further embed the strategy." },
    mid: { valueComment: "道筋（戦略）のチームスコアは中程度です。戦略への共感に個人差がある可能性があります。全員が「この戦略でいこう」と思える状態になると、チームの推進力が大きく変わります。", valueCommentEn: `Your team's Path (Strategy) score is at a middle level. There may be individual differences in strategic alignment. When everyone can say "let's go with this strategy," the team's momentum changes significantly.`, ctaComment: "戦略共有を加速するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to accelerate strategic alignment." },
    low: { valueComment: "道筋（戦略）のチームスコアが低めです。「この方向でいいのか」という疑問を持っているメンバーが多い可能性があります。", valueCommentEn: `Your team's Path (Strategy) score is low. Many members may be questioning "is this the right direction?"`, ctaComment: "戦略の再確認と共有のための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions for re-confirming and sharing the strategy." },
    bottom: { valueComment: "道筋（戦略）のチームスコアが最も低いレベルです。チームの方向性への疑問や不信感が広がっている可能性があります。早急な対応が必要な状態です。", valueCommentEn: "Your team's Path (Strategy) score is at the lowest level. Doubts and distrust about the team's direction may be spreading. Urgent action is needed.", ctaComment: "有料レポートで、最優先で取り組むべき戦略的アクションをお届けします。", ctaCommentEn: "The full report delivers the strategic actions to tackle first." },
  },
  rope: {
    top: { valueComment: "ロープ（リーダーの関わり）のチームスコアが最高レベルです。リーダーの指導・承認・目標提示がチーム全体に機能しています。", valueCommentEn: "Your team's Rope (Leadership & Engagement) score is at the highest level. The leader's guidance, recognition, and goal-setting are working effectively across the team.", ctaComment: "このリーダーシップをさらに活かすための示唆が、有料レポートにあります。", ctaCommentEn: "The full report has insights for leveraging this leadership further." },
    high: { valueComment: "ロープ（リーダーの関わり）のチームスコアが高い状態です。リーダーとメンバーの関係が機能しており、チームの安定感につながっています。", valueCommentEn: "Your team's Rope (Leadership & Engagement) score is high. The leader-member relationship is functioning well, contributing to team stability.", ctaComment: "リーダーシップをさらに強化するためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to further strengthen leadership." },
    mid: { valueComment: "ロープ（リーダーの関わり）のチームスコアは中程度です。「もう少しリーダーからの関わりがあれば」というメンバーの声があるかもしれません。", valueCommentEn: `Your team's Rope (Leadership & Engagement) score is at a middle level. Some members may be thinking "if only there were a bit more leader engagement."`, ctaComment: "リーダーの関わり方を改善するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to improve leader engagement." },
    low: { valueComment: "ロープ（リーダーの関わり）のチームスコアが低めです。リーダーとメンバーの間に距離感がある可能性があります。このカテゴリは、チームの幸福度と成果の両方に影響します。", valueCommentEn: "Your team's Rope (Leadership & Engagement) score is low. There may be a distance between the leader and members. This category affects both team happiness and performance.", ctaComment: "リーダーとメンバーの距離を縮めるための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to close the gap between leader and members." },
    bottom: { valueComment: "ロープ（リーダーの関わり）のチームスコアが最も低いレベルです。リーダーシップの機能不全がチーム全体に影響している可能性があります。早急な対応が必要な状態です。", valueCommentEn: "Your team's Rope (Leadership & Engagement) score is at the lowest level. Leadership dysfunction may be affecting the entire team. Urgent action is needed.", ctaComment: "有料レポートで、最優先で取り組むべきリーダーシップアクションをお届けします。", ctaCommentEn: "The full report delivers the leadership actions to tackle first." },
  },
  tire: {
    top: { valueComment: "タイヤ（仕組み・既成概念）のチームスコアが最高レベルです。評価の仕組みや自律性、新しいやり方への姿勢が整っており、チームが機動的に動けている状態です。", valueCommentEn: "Your team's Wheels (Structure & Conventions) score is at the highest level. Evaluation systems, autonomy, and openness to new approaches are all in place, allowing the team to move agilely.", ctaComment: "この機動力をさらに高めるための示唆が、有料レポートにあります。", ctaCommentEn: "The full report has insights for further enhancing this agility." },
    high: { valueComment: "タイヤ（仕組み・既成概念）のチームスコアが高い状態です。仕組みが機能しており、チームが自律的に動けています。", valueCommentEn: "Your team's Wheels (Structure & Conventions) score is high. Systems are functioning and the team can operate autonomously.", ctaComment: "仕組みをさらに改善するためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to further improve your systems." },
    mid: { valueComment: "タイヤ（仕組み・既成概念）のチームスコアは中程度です。「評価が不明確」「前例に縛られている」という感覚を持つメンバーがいる可能性があります。", valueCommentEn: "Your team's Wheels (Structure & Conventions) score is at a middle level. Some members may feel evaluation is unclear or that they are bound by precedent.", ctaComment: "仕組みを改善するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to improve your systems." },
    low: { valueComment: "タイヤ（仕組み・既成概念）のチームスコアが低めです。「頑張っているのに報われない」「前例に縛られて動きにくい」という声がチーム内にあるかもしれません。", valueCommentEn: `Your team's Wheels (Structure & Conventions) score is low. There may be voices in the team saying "despite our efforts it does not pay off" or "we are constrained by precedent."`, ctaComment: "仕組みを変えるための最優先アクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers the highest priority actions to change your systems." },
    bottom: { valueComment: "タイヤ（仕組み・既成概念）のチームスコアが最も低いレベルです。仕組みや慣習がチームの足かせになっている可能性があります。早急な改善が必要な状態です。", valueCommentEn: "Your team's Wheels (Structure & Conventions) score is at the lowest level. Systems and conventions may be shackling the team. Urgent improvement is needed.", ctaComment: "有料レポートで、仕組み改革のための最優先アクションをお届けします。", ctaCommentEn: "The full report delivers the highest priority actions for system reform." },
  },
  body: {
    top: { valueComment: "このチームのワゴンを押す人たちが、適した場所で・好きな役割で・仲間に応援されながら力強く動いています。適材適所・好き×得意・成長支援の3つが揃ったチームは、困難な課題にも立ち向かえます。", valueCommentEn: "The people pushing this team's wagon are in the right places, doing roles they love, cheered on by teammates. A team with the right people in the right roles, using their passions and strengths, supported to grow — this team can take on any challenge.", ctaComment: "この強みをさらにチームの成果につなげる方法が、有料レポートにあります。", ctaCommentEn: "The full report shows how to connect this strength even further to team results." },
    high: { valueComment: "このチームのワゴンを押す力が充実しています。メンバーが適材適所で・好きと得意を活かして・互いに応援し合える環境で動いています。この充実感が、チームの成長感につながっています。", valueCommentEn: "The people pushing this team's wagon have plenty of strength. Members are in the right roles, using their passions and strengths, in an environment where they support each other. This sense of fulfillment is what creates the team's sense of growth.", ctaComment: "チームの能力をさらに引き出すためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to draw out more of the team's capabilities." },
    mid: { valueComment: "このチームのワゴンを押す力はあるのに、まだ全部は使えていない感覚があるかもしれません。「もっと適材適所にしたい」「もっと好きや得意を活かしてほしい」「もっと応援し合える環境にしたい」という感覚があるかもしれません。", valueCommentEn: `This team has the strength to push the wagon, but may feel like it's not fully coming through. You may feel "we need better role assignments," "we want members to use their passions and strengths more," or "we want a more supportive environment."`, ctaComment: "メンバーの強みを引き出すための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to draw out members' strengths." },
    low: { valueComment: "このチームのワゴンを押す人たちが、力を発揮しきれていない状態かもしれません。「適材適所になっていない」「好きや得意が活かされていない」「成長を応援し合える環境が薄い」という状態かもしれません。", valueCommentEn: "The people pushing this team's wagon may not be fully expressing their strength. The team may be in a state of mismatched roles, underutilized passions and strengths, and insufficient mutual support for growth.", ctaComment: "適材適所を実現するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to achieve the right people in the right roles." },
    bottom: { valueComment: "このチームのワゴンを押す人たちの力が大きく落ちているかもしれません。適材適所でなく・好きや得意が活かせず・応援し合えない状態が続くと、メンバーのエネルギーが静かに消耗していきます。早急な対応が必要な状態です。", valueCommentEn: "The strength of the people pushing this team's wagon may have dropped significantly. When people aren't in the right roles, their passions and strengths aren't utilized, and they can't support each other — team members' energy quietly drains away. Urgent action is needed.", ctaComment: "有料レポートで、チームの活力を取り戻すための最優先アクションをお届けします。", ctaCommentEn: "The full report delivers the highest priority actions to restore team vitality." },
  },
  attitude: {
    top: { valueComment: `押す人の表情（風土・文化）のチームスコアが最高レベルです。${DATA_STATS.teamsDisplay}のデータで、このカテゴリはチームの幸福度と最も強く連動します（r=0.779）。スコアが高いチームの幸福度平均は4.36です。このチームは最も重要な基盤が整っています。`, valueCommentEn: `Your team's Attitude (Culture & Climate) score is at the highest level. Across ${DATA_STATS.teamsDisplay}, this category has the strongest connection to team happiness (r=0.779). Teams scoring high here average 4.36 in happiness. Your team has its most important foundation in place.`, ctaComment: "この風土をさらに強化し、成果につなげるための示唆が有料レポートにあります。", ctaCommentEn: "The full report has insights for further strengthening this culture and connecting it to results." },
    high: { valueComment: "押す人の表情（風土・文化）のチームスコアが高い状態です。協力・尊重・質への姿勢が機能しており、チームの幸福度にも好影響を与えています。このカテゴリはチームの幸福度と最も強く連動します。", valueCommentEn: "Your team's Attitude (Culture & Climate) score is high. Collaboration, respect, and commitment to quality are working, positively affecting team happiness. This category has the strongest connection to team happiness.", ctaComment: "この風土をさらに豊かにするためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to further enrich this culture." },
    mid: { valueComment: `押す人の表情（風土・文化）のチームスコアは中程度です。${DATA_STATS.teamsDisplay}のデータで、このカテゴリはチームの幸福度と最も強く連動することが確認されています。ここを改善すると、チームの幸福度と成果が同時に上がる可能性があります。`, valueCommentEn: `Your team's Attitude (Culture & Climate) score is at a middle level. Data from ${DATA_STATS.teamsDisplay} confirms this category has the strongest connection to team happiness. Improving this could simultaneously raise both team happiness and performance.`, ctaComment: "風土改善のための最も効果的なアクションを、有料レポートで特定します。", ctaCommentEn: "The full report identifies the most effective actions for culture improvement." },
    low: { valueComment: "押す人の表情（風土・文化）のチームスコアが低めです。データでは、このスコアのチームの幸福度平均は2.60と低い状態にあります。チームの雰囲気や関係性に大きな課題がある可能性があります。", valueCommentEn: "Your team's Attitude (Culture & Climate) score is low. Data shows teams at this level average 2.60 in happiness. There may be significant challenges in team atmosphere and relationships.", ctaComment: "チームの風土を改善するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to improve the team culture." },
    bottom: { valueComment: `押す人の表情（風土・文化）のチームスコアが最も低いレベルです。データでは、このレベルのチームの93.5%が不幸な状態にあります（幸福度平均1.35）。チームの風土が根本的な課題になっている可能性があります。早急な対応が必要です。`, valueCommentEn: "Your team's Attitude (Culture & Climate) score is at the lowest level. Data shows 93.5% of teams at this level are in an unhappy state (happiness average 1.35). Team culture may be a fundamental challenge. Urgent action is needed.", ctaComment: "有料レポートで、チームの風土を変えるための最優先アクションをお届けします。", ctaCommentEn: "The full report delivers the highest priority actions to change team culture." },
  },
  cargo: {
    top: { valueComment: "このチームのワゴンの積荷に、旅に必要な装備が揃っています。「仲間の強み弱みを知っている地図」「外部とのネットワーク」「最新のツールや技術の活用力」——この3つが揃ったチームは、外部の変化にも柔軟に対応できます。", valueCommentEn: `This team's wagon cargo holds all the equipment needed for the journey: a map of each member's strengths and weaknesses, external network connections, and the ability to leverage the latest tools and technologies. A team with all three can flexibly adapt to external changes.`, ctaComment: "この強みをさらに活かすための示唆が、有料レポートにあります。", ctaCommentEn: "The full report has insights for leveraging this strength further." },
    high: { valueComment: "このチームのワゴンの積荷が充実しています。互いの強み弱みを理解し、外部リソースを活用し、新技術も取り入れられている状態です。この装備の豊かさが、チームの可能性を広げています。", valueCommentEn: "This team's wagon cargo is well-stocked. The team understands each other's strengths and weaknesses, can leverage external resources, and is incorporating new technologies. This richness of equipment is expanding the team's possibilities.", ctaComment: "リソースをさらに活用するためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to further leverage your resources." },
    mid: { valueComment: "このチームのワゴンの積荷が、まだ十分に揃っていないかもしれません。「互いの強み弱みをもっと理解できれば」「外部のリソースをもっと活かせれば」「新技術をもっと取り入れられれば」という感覚があるかもしれません。", valueCommentEn: `This team's wagon cargo may not be fully stocked yet. You may feel "if only we understood each other's strengths and weaknesses better," "if only we could leverage external resources more," or "if only we could incorporate new technologies more."`, ctaComment: "リソース活用を改善するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to improve resource utilization." },
    low: { valueComment: "このチームのワゴンの積荷が薄く、旅の装備が心もとない状態かもしれません。「仲間のことが十分にわかっていない」「外の世界とのつながりが少ない」「新しいツールを活かしきれていない」という状態かもしれません。データでは、このスコアのチームの幸福度平均は2.43と低い状態にあります。", valueCommentEn: `This team's wagon cargo may be thin, leaving the equipment feeling insufficient. The team may not know each other well enough, have few external connections, and not be fully leveraging new tools. Data shows teams at this level average 2.43 in happiness.`, ctaComment: "チームのリソースを活性化するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to activate team resources." },
    bottom: { valueComment: `このチームのワゴンの積荷が、ほとんど空の状態かもしれません。仲間への相互理解・外部とのつながり・最新技術の活用、いずれも機能していない状態は、チームの対応力を大きく奪います。データでは、このレベルのチームの93.8%が不幸な状態にあります。`, valueCommentEn: `This team's wagon cargo may be nearly empty. When mutual understanding, external connections, and new technology utilization are all not functioning — the team's adaptability suffers greatly. Data shows 93.8% of teams at this level are in an unhappy state.`, ctaComment: "有料レポートで、チームのリソースを活性化するための最優先アクションをお届けします。", ctaCommentEn: "The full report delivers the highest priority actions to activate team resources." },
  },
  diversity: {
    top: { valueComment: "このチームのワゴンの旅に、個性豊かな登場人物たちが集まり、それぞれが堂々と舞台に立っています。衝突を恐れず意見をぶつけ合い、そこから新しい価値が生まれています。データでも、このスコアのチームの幸福度は非常に高い状態にあります。", valueCommentEn: "Characters full of individuality have gathered for this team's wagon journey, each standing boldly on the stage. They engage without fear of conflict, and new value is being born from those exchanges. Data also shows teams at this level have very high happiness.", ctaComment: "この多様性をさらに成果につなげる方法が、有料レポートにあります。", ctaCommentEn: "The full report shows how to connect this diversity even further to results." },
    high: { valueComment: "このチームのワゴンの旅に、多彩な個性の登場人物たちがいます。性別・年齢に関係なく適性が活かされ、それぞれが能力を発揮しています。この多様な化学反応が、チームの旅を豊かにしています。", valueCommentEn: "The team's wagon journey has characters with diverse individuality. Strengths are utilized regardless of gender or age, and everyone is making full use of their capabilities. These diverse chemical reactions are enriching the team's journey.", ctaComment: "多様性をさらに活かすためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to further leverage diversity." },
    mid: { valueComment: "このチームのワゴンの旅の登場人物たちが、まだ舞台の脇に立っているかもしれません。「もっと個々の個性が活かされれば」「もっと意見をぶつけ合えれば」という感覚があるかもしれません。それぞれが舞台に立つほど、チームの旅は豊かになります。", valueCommentEn: `The characters on this team's wagon journey may still be standing in the wings. You may feel "if only individual personalities could be better utilized" or "if only we could engage more openly." The more each person steps onto the stage, the richer the team's journey becomes.`, ctaComment: "多様性を高めるための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to enhance diversity." },
    low: { valueComment: "このチームのワゴンの旅で、個性や意見が出にくい状態かもしれません。「衝突を避けがち」「自分の特性を発揮しにくい」という空気があるかもしれません。安全に意見をぶつけ合える関係が生まれると、チームの旅の質が大きく変わります。", valueCommentEn: `It may be hard to express individuality or opinions on this team's wagon journey. There may be an atmosphere of "we tend to avoid conflict" or "it's hard to demonstrate my capabilities." When safe engagement emerges, the team's journey quality changes dramatically.`, ctaComment: "チームの多様性を高めるための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to enhance team diversity." },
    bottom: { valueComment: "このチームのワゴンの旅で、登場人物たちが個性を発揮できていない状態かもしれません。衝突を恐れ・意見が出にくく・互いの強みで新しい価値が生まれにくい環境は、チームの創造性と活力を大きく奪います。", valueCommentEn: "The characters on this team's wagon journey may not be able to express their individuality. An environment where conflict is feared, opinions are hard to share, and new value from each other's strengths is hard to create — this significantly undermines the team's creativity and vitality.", ctaComment: "有料レポートで、チームの多様性を回復するための最優先アクションをお届けします。", ctaCommentEn: "The full report delivers the highest priority actions to restore team diversity." },
  },
};

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * スコアをpositionに変換する
 * scoring.tsのSCORE_LEVELSと連動させること
 */
export function scoreToPosition(score: number): ScorePosition {
  if (score >= 4.5) return "top";
  if (score >= 3.5) return "high";
  if (score >= 2.75) return "mid";
  if (score >= 2.0) return "low";
  return "bottom";
}

/** カテゴリ×スコアから示唆コメントを取得する（個人用） */
export function getPersonalInsight(category: string, score: number): InsightComment | null {
  const position = scoreToPosition(score);
  return PERSONAL_INSIGHT_COMMENTS[category]?.[position] ?? null;
}

/** カテゴリ×スコアから示唆コメントを取得する（チーム用） */
export function getTeamInsight(category: string, score: number): InsightComment | null {
  const position = scoreToPosition(score);
  return TEAM_INSIGHT_COMMENTS[category]?.[position] ?? null;
}

// ============================================================
// 後方互換：チーム結果ページで使用中の旧関数
// ============================================================

export function getStrengthComment(categoryName: string, score: string, isEn: boolean): { main: string; locked: string } {
  if (isEn) {
    return {
      main: `The greatest driving force of this team is '${categoryName}'. A score of ${score} shows that your team has genuine strength in this area.`,
      locked: "The AI Report will tell you exactly when and how this strength shines brightest, and specific actions to develop it further.",
    };
  }
  return {
    main: `このチームの最大の推進力は「${categoryName}」です。スコア${score}は、チームがこの領域で本質的な力を持っていることを示しています。`,
    locked: "AIレポートでは、この強みがチームのどんな場面で最も活きているか、さらに伸ばすための具体的なアクションをお伝えします。",
  };
}

export function getImprovementComment(categoryName: string, score: string, isEn: boolean): { main: string; locked: string } {
  if (isEn) {
    return {
      main: `'${categoryName}' is where your team has the most room to grow. A score of ${score} suggests there may be some hidden challenge here.`,
      locked: "The AI Report will present hypotheses about why this score occurred and give you specific improvement actions you can start tomorrow.",
    };
  }
  return {
    main: `「${categoryName}」がチームの成長の余地です。スコア${score}は、ここに何らかの見えにくい課題が潜んでいる可能性を示しています。`,
    locked: "AIレポートでは、なぜこのスコアになっているのかAIが仮説を提示し、明日からできる具体的な改善アクションをお伝えします。",
  };
}

export function getGapComment(categoryName: string, isEn: boolean): { main: string; data: string; locked: string } {
  if (isEn) {
    return {
      main: `There is a significant gap in how team members perceive '${categoryName}'. Even within the same team, people can see very different landscapes. This doesn't mean anyone is wrong.`,
      data: "Data from 120,000+ respondents shows that teams with larger perception gaps tend to have lower happiness scores.",
      locked: "The AI Report will explain the nature of this gap and provide a facilitation guide for safe team dialogue.",
    };
  }
  return {
    main: `「${categoryName}」でメンバー間の認識に大きなズレがあります。同じチームにいても、見えている景色がこんなに違うことがあります。これは誰かが間違っているのではありません。`,
    data: "12万人のデータでは、このような認識ギャップが大きいチームほど幸福度スコアが下がりやすい傾向があります。",
    locked: "AIレポートでは、このギャップの正体とチームで安全に対話するためのファシリテーションガイドをお伝えします。",
  };
}

export type EngagementQuadrant = "engaged" | "vision_driven" | "action_driven" | "at_risk";

export function getEngagementQuadrant(happinessAvg: number, missionAvg: number): EngagementQuadrant {
  if (happinessAvg >= 3.5 && missionAvg >= 3.5) return "engaged";
  if (happinessAvg < 3.5 && missionAvg >= 3.5) return "vision_driven";
  if (happinessAvg >= 3.5 && missionAvg < 3.5) return "action_driven";
  return "at_risk";
}

export function getSummaryComment(quadrant: EngagementQuadrant, isEn: boolean): { main: string; locked: string } {
  const comments: Record<EngagementQuadrant, { ja: { main: string; locked: string }; en: { main: string; locked: string } }> = {
    engaged: {
      ja: { main: "このチームのエンゲージメントは高い水準にあります。「エンゲージ型」のチームは、困難な状況でも力を発揮できる土台があります。", locked: "AIレポートでは、この状態をさらに高めるチーム固有のアクションプランをお伝えします。" },
      en: { main: "Your team's engagement is at a high level. 'Engaged' teams have the foundation to perform even in challenging situations.", locked: "The AI Report will provide a team-specific action plan to take your engagement even higher." },
    },
    vision_driven: {
      ja: { main: "このチームは方向性への共感は高いのに、幸福度が伴っていない「理念先行型」の状態です。頑張っているのに報われていない感覚がチームのどこかにあるかもしれません。", locked: "AIレポートでは、この状態の原因とチームの熱量を回復させる具体的な方法をお伝えします。" },
      en: { main: "Your team has strong alignment with direction, but happiness hasn't caught up — this is what we call a 'Vision-Driven' state. There may be a sense somewhere in the team of working hard without feeling rewarded.", locked: "The AI Report will identify the cause and provide specific ways to restore your team's energy." },
    },
    action_driven: {
      ja: { main: "このチームは今の仕事は楽しめているものの、「なんのためにやっているか」がやや見えにくい「実行先行型」の状態です。", locked: "AIレポートでは、チームの目的意識を高める対話テーマと具体的なアクションをお伝えします。" },
      en: { main: "Your team enjoys the work itself, but the sense of purpose — 'why are we doing this?' — may be a little unclear. This is what we call an 'Action-Driven' state.", locked: "The AI Report will provide dialogue themes and specific actions to strengthen your team's sense of purpose." },
    },
    at_risk: {
      ja: { main: "このチームは今、少し疲れている状態かもしれません。でも、このサーベイに全員が答えてくれたことは、チームに「向き合う力」がある証拠です。", locked: "AIレポートでは、今すぐできる小さくて確実な改善アクションをお伝えします。" },
      en: { main: "Your team may be feeling a little tired right now. But the fact that everyone completed this survey is proof that your team has the courage to face itself.", locked: "The AI Report will give you small but certain improvement actions you can take right now." },
    },
  };
  return isEn ? comments[quadrant].en : comments[quadrant].ja;
}
