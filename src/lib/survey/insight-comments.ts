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
    top: { valueComment: `ワゴンの行き先の景色が、くっきりと輝いています。「なぜここで働くか」という問いに、あなた自身の誇りある答えを持っている状態です。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の95%が幸福度も高い状態にあります。`, valueCommentEn: `The landscape ahead of your wagon is shining brightly. You have your own proud answer to "why I work here." Data from ${DATA_STATS.respondentsDisplay} shows 95% of people at this level also have high happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "ワゴンの行き先の景色がよく見えており、その方向へ誇りを持って進んでいます。目指す先への共感が、あなたの働く力の源になっています。", valueCommentEn: "The landscape ahead of your wagon is clear, and you're moving toward it with pride. Your resonance with the destination is the source of your working energy.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `ワゴンの行き先の景色が、少し霞んで見えているかもしれません。${DATA_STATS.respondentsDisplay}のデータでは、この「景色」カテゴリが幸福度と最も強く連動しています。景色が鮮明になると、ワゴンを押す力が大きく変わります。`, valueCommentEn: `The destination of your wagon may look a little hazy. Data from ${DATA_STATS.respondentsDisplay} shows this Landscape category has the strongest connection to happiness. When the view becomes clearer, your energy to push the wagon changes dramatically.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "ワゴンがどこへ向かっているのか、見えにくくなっているかもしれません。霧の中でも前に進もうとしているあなたの力は本物です。データでは、この景色カテゴリを高めることが幸福度に最も大きな影響を与えます。", valueCommentEn: "You may be losing sight of where the wagon is headed. But the strength you show — moving forward even through the fog — is real. Data shows improving this Landscape category has the greatest impact on happiness.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "ワゴンの行き先が全く見えない状態かもしれません。「なぜここで働いているのか」という問いが、心の中にあるかもしれません。それは弱さではなく、あなたが本気でこの旅に向き合っているサインです。", valueCommentEn: `You may not be able to see where the wagon is heading at all. You might be asking "why am I on this journey?" That is not weakness — it is a sign that you care deeply about where you are going.`, ctaComment: "", ctaCommentEn: "" },
  },

  road: {
    top: { valueComment: "ワゴンが走る道が、整備された石畳のようにスムーズです。チームの戦略という「道」を信頼して、迷わず前へ進める状態です。この確信が、日々の仕事の推進力になっています。", valueCommentEn: "The road your wagon travels is smooth, like well-laid cobblestone. You trust the team's strategy as your \"road\" and can move forward without hesitation. This conviction drives your daily work.", ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "ワゴンが走る道が見えており、その道を信頼して進んでいます。チームの戦略への共感が、仕事の確かさにつながっています。", valueCommentEn: "You can see the road and trust it as you move forward. Your alignment with the team's strategy creates a sense of confidence in your work.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "ワゴンが走る道が、一部舗装されていない部分があるかもしれません。「この方向でいいのかな」という感覚があるかもしれません。道への確信が深まると、ワゴンの進みがずっと軽くなります。", valueCommentEn: `The road your wagon travels may have some unpaved sections. You might feel "is this really the right direction?" When confidence in the road deepens, the wagon moves much more lightly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "ワゴンが走る道に、疑問を感じているかもしれません。「本当にこの道でいいのか」という問いは、あなたが旅を真剣に考えている証です。その疑問は大切なシグナルです。", valueCommentEn: `You may be questioning the road your wagon is on. Asking "is this really the right road?" is a sign that you take the journey seriously. That question is an important signal.`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "ワゴンが走る道が見えず、迷子になっている感覚があるかもしれません。チームの方向性への共感が持てない状態は、大きなエネルギーの消耗につながります。あなたの感覚は正直で、大切なシグナルです。", valueCommentEn: "You may feel lost, unable to see the road the wagon is on. Not finding alignment with the team's direction drains enormous energy. Your feelings are honest and important signals.", ctaComment: "", ctaCommentEn: "" },
  },

  rope: {
    top: { valueComment: "ロープがピンと張っており、リーダーの方向感がしっかりと伝わっています。指導・承認・目標提示が機能しており、「自分に期待されていること」も明確に見えています。この安心感が、チームへの貢献感につながっています。", valueCommentEn: `The rope is taut and the leader's direction is being transmitted clearly. Guidance, recognition, and goal-setting are working, and "what is expected of me" is clearly visible. This sense of security connects to your feeling of contribution.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "ロープがしっかりと機能しており、リーダーとの関係が安定しています。適切なタイミングでの指導と承認が、あなたの仕事の安定感につながっています。", valueCommentEn: "The rope is working well and your relationship with the leader is stable. Timely guidance and recognition are creating a sense of confidence in your work.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "ロープが少したるんでいるかもしれません。「もう少し指導や承認がほしい」「目標がもう少し明確なら」という感覚があるかもしれません。ロープが張れば、ワゴンはもっとスムーズに進みます。", valueCommentEn: `The rope may have a bit of slack. You might feel "I'd like a bit more guidance or recognition" or "clearer goals would help." When the rope is taut again, the wagon will move more smoothly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "ロープが大きくたるんでおり、リーダーとの距離を感じているかもしれません。「評価されていない」「目標が見えない」「期待されていることがわからない」という感覚があるかもしれません。", valueCommentEn: `The rope may be quite slack and you may feel distance from your leader. You may feel "I'm not being recognized," "I can't see the goal," or "I don't know what's expected of me."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "ロープが機能しておらず、リーダーとワゴンが別々に動いているような状態かもしれません。一人で抱え込まず、この状況を言語化することが第一歩です。", valueCommentEn: "The rope may not be functioning at all — the leader and the wagon may be moving separately. The first step is not carrying this alone, but putting the situation into words.", ctaComment: "", ctaCommentEn: "" },
  },

  tire: {
    top: { valueComment: "ワゴンのタイヤが丸く整っており、スムーズに転がっています。公正な評価・自律的に動ける範囲・前例にとらわれない姿勢——この3つが揃うと、ワゴンの走りは軽やかになります。", valueCommentEn: "Your wagon's wheels are round and smooth, rolling easily. Fair evaluation, room for autonomous action, and freedom from precedent — when these three align, the wagon runs lightly.", ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "タイヤがほぼ丸く、ワゴンが比較的スムーズに進んでいます。評価の仕組みが機能しており、自律的に動ける環境が整っています。", valueCommentEn: "Your wheels are nearly round and the wagon moves relatively smoothly. The evaluation system is working and you have room to act autonomously.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "タイヤが少し四角くなっているかもしれません。「評価が不明確」「前例に縛られている」という感覚が部分的にあるかもしれません。タイヤが丸くなるほど、ワゴンの走りが軽くなります。", valueCommentEn: "Your wheels may be getting a little square. You may partially feel that evaluation is unclear or that you are bound by precedent. The rounder the wheels become, the more lightly the wagon runs.", ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "タイヤがかなり四角くなっており、ワゴンが進むたびにガタガタしているかもしれません。「頑張っているのに正当に評価されない」「前例に縛られて動きにくい」という感覚があるかもしれません。", valueCommentEn: `Your wheels may be quite square, making the wagon bump with every turn. You may feel "I'm not being fairly evaluated despite my efforts" or "I'm constrained by precedent."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "タイヤが完全に四角くなっており、ワゴンが前に進むのに大きな抵抗がある状態かもしれません。仕組みや慣習が、あなたの力を活かせない状態にしています。", valueCommentEn: "Your wheels may be completely square, creating great resistance to moving forward. Systems and conventions may be preventing your strength from being fully utilized.", ctaComment: "", ctaCommentEn: "" },
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
    top: { valueComment: `ワゴンを押す人たちの表情が、生き生きと輝いています。協力し合い・尊重し合い・意見を言い合える環境——これは簡単には手に入らない財産です。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の95%以上が幸福度も高い状態にあります。`, valueCommentEn: `The faces of the people pushing the wagon are bright and alive. An environment of mutual cooperation, respect, and open expression — this is a treasure not easily found. Data from ${DATA_STATS.respondentsDisplay} shows over 95% of people at this level also have high happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "ワゴンを押す人たちの表情が穏やかで、チームの雰囲気が良い状態です。協力・尊重・質への姿勢が機能しており、この表情がワゴンを前へ動かす力になっています。このカテゴリは幸福度と最も強く連動します。", valueCommentEn: "The faces of the people pushing the wagon are calm and the team atmosphere is good. Cooperation, respect, and commitment to quality are working — these expressions are what propels the wagon forward. This category has the strongest connection to happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "ワゴンを押す人たちの表情が、少し疲れて見えるかもしれません。「もう少し協力し合えれば」「もう少し認め合えれば」という感覚があるかもしれません。このカテゴリは幸福度に最も大きな影響を与えます。表情が変わると、ワゴンの動きが大きく変わります。", valueCommentEn: `The faces of the people pushing the wagon may look a little tired. You might feel "if only we could collaborate more" or "if only we recognized each other more." This category has the greatest impact on happiness. When expressions change, how the wagon moves changes dramatically.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "ワゴンを押す人たちの表情が重そうです。データでは、このカテゴリが低いと81%のメンバーが幸福度も低い状態にあります。「認められていない」「意見が言いにくい」という感覚があるかもしれません。", valueCommentEn: `The faces of the people pushing the wagon look heavy. Data shows 81% of members with low scores here also have low happiness. You may feel "I'm not being recognized" or "it's hard to voice my opinions."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "ワゴンを押す人たちの表情が、今とても苦しそうです。データでは、このカテゴリが最低レベルのチームの93.5%が不幸な状態にあります。この表情が変わるだけで、ワゴンの動きは全く変わります。", valueCommentEn: "The faces of the people pushing the wagon look very strained right now. Data shows 93.5% of teams at the lowest level are in an unhappy state. Simply changing these expressions would completely transform how the wagon moves.", ctaComment: "", ctaCommentEn: "" },
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
    top: { valueComment: `このチームのワゴンは、行き先の景色がくっきりと輝いています。チーム全員が「なぜここへ向かうか」に誇りある共通の答えを持っている——これがワゴンを力強く前へ動かしています。${DATA_STATS.teamsDisplay}のデータで、このスコアのチームの幸福度平均は4.25です。`, valueCommentEn: `This team's wagon has a destination that shines brightly. Every team member shares a proud common answer to "why are we headed there" — and that is what drives the wagon powerfully forward. Across ${DATA_STATS.teamsDisplay}, teams at this level average 4.25 in happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンは、行き先の景色がよく見えており、その方向へ誇りを持って進んでいます。チームとしての目的意識が、メンバーの幸福度にも好影響を与えています。", valueCommentEn: "This team's wagon has a clear view of its destination and is moving toward it with pride. The team's sense of purpose is positively affecting member happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "このチームのワゴンの行き先が、少し霞んで見えているかもしれません。このカテゴリはチームの幸福度と最も強く連動します。「このチームはなぜここへ向かうのか」を全員で確認できると、ワゴンのエネルギーが大きく変わります。", valueCommentEn: `This team's wagon destination may look a little hazy. This category has the strongest connection to team happiness. When everyone can confirm "why is this team headed there," the wagon's energy changes dramatically.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンが、どこへ向かっているか見えにくくなっているかもしれません。データでは、このカテゴリが低いチームの幸福度平均は2.43と低い状態にあります。まず景色を取り戻すことが最優先です。", valueCommentEn: "This team's wagon may be losing sight of where it's headed. Data shows teams with low scores here average 2.43 in happiness. Restoring the view is the top priority.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのワゴンが、行き先を見失っているかもしれません。景色が見えないとき、メンバーはそれぞれ違う方向を向いてしまいます。「このチームはなぜ存在するのか」を問い直すことが最初の一歩です。", valueCommentEn: `This team's wagon may have lost sight of its destination. When the view disappears, members end up looking in different directions. Re-examining "why does this team exist" is the first step.`, ctaComment: "", ctaCommentEn: "" },
  },
  road: {
    top: { valueComment: "このチームのワゴンが走る道が、しっかりと整備されています。戦略を信頼して、チーム全員が迷わず同じ方向へ進んでいます。この「道への信頼」が、チームの推進力になっています。", valueCommentEn: "The road this team's wagon travels is well-maintained. The team trusts the strategy and everyone is moving confidently in the same direction. This \"trust in the road\" is the team's driving force.", ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンが走る道がよく見えており、戦略への共感がチームの推進力になっています。整備された道を走れるチームは、変化にも対応しやすい傾向があります。", valueCommentEn: "The road this team's wagon travels is clearly visible and strategic alignment is driving the team forward. Teams that travel on well-maintained roads tend to adapt to change more easily.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "このチームのワゴンが走る道が、一部整備されていない部分があるかもしれません。戦略への共感に個人差がある可能性があります。全員が「この道でいこう」と思える状態になると、チームの推進力が大きく変わります。", valueCommentEn: `The road this team's wagon travels may have some unmaintained sections. There may be individual differences in strategic alignment. When everyone can say "let's go with this road," the team's momentum changes significantly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンが走る道に、疑問を持っているメンバーが多いかもしれません。「この方向でいいのか」という声がチーム内にあるかもしれません。道への不信は、チームのエネルギーを静かに奪います。", valueCommentEn: `Many members may be questioning the road this team's wagon is on. There may be voices within the team asking "is this really the right direction?" Distrust in the road quietly drains the team's energy.`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのワゴンが走る道が見えず、迷走しているかもしれません。方向性への疑問や不信感が広がっている可能性があります。道を示すことが急務です。", valueCommentEn: "This team's wagon may be wandering without a visible road. Doubts and distrust about direction may be spreading. Showing the way forward is urgent.", ctaComment: "", ctaCommentEn: "" },
  },
  rope: {
    top: { valueComment: "ロープがピンと張っており、リーダーの力がチーム全体にしっかりと伝わっています。指導・承認・明確な目標・期待の共有——これらが機能しているチームは、安心して前へ進めます。", valueCommentEn: "The rope is taut and the leader's strength is being transmitted effectively throughout the entire team. Guidance, recognition, clear goals, and shared expectations — when these work, the team can move forward with confidence.", ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "ロープがしっかりと機能しており、リーダーとメンバーの関係がワゴンの安定感につながっています。適切な指導と承認が、チームの安心感を生み出しています。", valueCommentEn: "The rope is functioning well and the leader-member relationship is contributing to the wagon's stability. Appropriate guidance and recognition are creating a sense of security in the team.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "ロープが少したるんでいるかもしれません。「もう少しリーダーからの関わりがあれば」というメンバーの声があるかもしれません。ロープが張れば、ワゴンはもっとスムーズに進みます。", valueCommentEn: `The rope may have some slack. Some members may be thinking "a little more leader engagement would help." When the rope is taut, the wagon will move more smoothly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "ロープが大きくたるんでおり、リーダーとワゴンの間に距離感があるかもしれません。「目標が見えない」「期待されていることがわからない」という声がメンバーから出ているかもしれません。このカテゴリはチームの幸福度と成果の両方に影響します。", valueCommentEn: `The rope may be quite slack with growing distance between the leader and the wagon. Members may be saying "I can't see the goal" or "I don't know what's expected." This category affects both team happiness and performance.`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "ロープが機能しておらず、リーダーとチームが別々に動いている状態かもしれません。リーダーシップの機能不全がチーム全体に影響している可能性があります。早急な対応が必要な状態です。", valueCommentEn: "The rope may not be functioning at all with the leader and team moving separately. Leadership dysfunction may be affecting the entire team. Urgent action is needed.", ctaComment: "", ctaCommentEn: "" },
  },
  tire: {
    top: { valueComment: "このチームのワゴンのタイヤが丸く整っており、スムーズに走っています。公正な評価・自律的に動ける範囲・前例にとらわれない姿勢——この3つが揃ったチームは、変化にも機動的に対応できます。", valueCommentEn: "This team's wagon wheels are round and smooth, rolling easily. Fair evaluation, room for autonomous action, and freedom from precedent — a team with all three can respond agilely to change.", ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのタイヤがほぼ丸く、ワゴンが比較的スムーズに進んでいます。仕組みが機能しており、チームが自律的に動けています。", valueCommentEn: "This team's wheels are nearly round and the wagon moves relatively smoothly. Systems are functioning and the team can operate autonomously.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "このチームのタイヤが少し四角くなっているかもしれません。「評価が不明確」「前例に縛られている」と感じているメンバーがいる可能性があります。タイヤが丸くなるほど、チームの動きが軽くなります。", valueCommentEn: "This team's wheels may be getting a little square. Some members may feel evaluation is unclear or that they are bound by precedent. The rounder the wheels become, the more lightly the team moves.", ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのタイヤがかなり四角くなっており、ワゴンが進むたびにガタガタしている状態かもしれません。「頑張っているのに報われない」「前例に縛られて動きにくい」という声がチーム内にあるかもしれません。", valueCommentEn: `This team's wheels may be quite square making the wagon bump along with every turn. There may be voices in the team saying "despite our efforts it doesn't pay off" or "we are constrained by precedent."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのタイヤが完全に四角くなっており、ワゴンが前に進むのに大きな抵抗がある状態かもしれません。仕組みや慣習がチームの足かせになっている可能性があります。早急な改善が必要です。", valueCommentEn: "This team's wheels may be completely square creating great resistance to moving forward. Systems and conventions may be shackling the team. Urgent improvement is needed.", ctaComment: "", ctaCommentEn: "" },
  },
  body: {
    top: { valueComment: "このチームのワゴンを押す人たちが、適した場所で・好きな役割で・仲間に応援されながら力強く動いています。適材適所・好き×得意・成長支援の3つが揃ったチームは、困難な課題にも立ち向かえます。", valueCommentEn: "The people pushing this team's wagon are in the right places, doing roles they love, cheered on by teammates. A team with the right people in the right roles, using their passions and strengths, supported to grow — this team can take on any challenge.", ctaComment: "この強みをさらにチームの成果につなげる方法が、有料レポートにあります。", ctaCommentEn: "The full report shows how to connect this strength even further to team results." },
    high: { valueComment: "このチームのワゴンを押す力が充実しています。メンバーが適材適所で・好きと得意を活かして・互いに応援し合える環境で動いています。この充実感が、チームの成長感につながっています。", valueCommentEn: "The people pushing this team's wagon have plenty of strength. Members are in the right roles, using their passions and strengths, in an environment where they support each other. This sense of fulfillment is what creates the team's sense of growth.", ctaComment: "チームの能力をさらに引き出すためのアクションが、有料レポートにあります。", ctaCommentEn: "The full report has actions to draw out more of the team's capabilities." },
    mid: { valueComment: "このチームのワゴンを押す力はあるのに、まだ全部は使えていない感覚があるかもしれません。「もっと適材適所にしたい」「もっと好きや得意を活かしてほしい」「もっと応援し合える環境にしたい」という感覚があるかもしれません。", valueCommentEn: `This team has the strength to push the wagon, but may feel like it's not fully coming through. You may feel "we need better role assignments," "we want members to use their passions and strengths more," or "we want a more supportive environment."`, ctaComment: "メンバーの強みを引き出すための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to draw out members' strengths." },
    low: { valueComment: "このチームのワゴンを押す人たちが、力を発揮しきれていない状態かもしれません。「適材適所になっていない」「好きや得意が活かされていない」「成長を応援し合える環境が薄い」という状態かもしれません。", valueCommentEn: "The people pushing this team's wagon may not be fully expressing their strength. The team may be in a state of mismatched roles, underutilized passions and strengths, and insufficient mutual support for growth.", ctaComment: "適材適所を実現するための具体的なアクションを、有料レポートでお届けします。", ctaCommentEn: "The full report delivers specific actions to achieve the right people in the right roles." },
    bottom: { valueComment: "このチームのワゴンを押す人たちの力が大きく落ちているかもしれません。適材適所でなく・好きや得意が活かせず・応援し合えない状態が続くと、メンバーのエネルギーが静かに消耗していきます。早急な対応が必要な状態です。", valueCommentEn: "The strength of the people pushing this team's wagon may have dropped significantly. When people aren't in the right roles, their passions and strengths aren't utilized, and they can't support each other — team members' energy quietly drains away. Urgent action is needed.", ctaComment: "有料レポートで、チームの活力を取り戻すための最優先アクションをお届けします。", ctaCommentEn: "The full report delivers the highest priority actions to restore team vitality." },
  },
  attitude: {
    top: { valueComment: `このチームのワゴンを押す人たちの表情が、生き生きと輝いています。${DATA_STATS.teamsDisplay}のデータで、このカテゴリはチームの幸福度と最も強く連動します（r=0.779）。スコアが高いチームの幸福度平均は4.36——この表情こそが、ワゴンを動かす最大の力です。`, valueCommentEn: `The faces of the people pushing this team's wagon are bright and alive. Across ${DATA_STATS.teamsDisplay}, this category has the strongest connection to team happiness (r=0.779). Teams scoring high here average 4.36 in happiness — these expressions are the greatest force moving the wagon.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンを押す人たちの表情が穏やかで、協力・尊重・質への姿勢が機能しています。このカテゴリはチームの幸福度と最も強く連動します。この表情が、ワゴンを前へ進める大きな力になっています。", valueCommentEn: "The faces of the people pushing this team's wagon are calm and collaboration, respect, and quality commitment are working. This category has the strongest connection to team happiness. These expressions are a great force propelling the wagon forward.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのワゴンを押す人たちの表情が、少し疲れて見えるかもしれません。${DATA_STATS.teamsDisplay}のデータで、このカテゴリはチームの幸福度と最も強く連動することが確認されています。表情が変わると、ワゴンの動きが大きく変わります。`, valueCommentEn: `The faces of the people pushing this team's wagon may look a little tired. Data from ${DATA_STATS.teamsDisplay} confirms this category has the strongest connection to team happiness. When these expressions change, how the wagon moves will change dramatically.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンを押す人たちの表情が重そうです。データでは、このスコアのチームの幸福度平均は2.60と低い状態にあります。表情が変わるだけで、ワゴンの動きは全く変わります。", valueCommentEn: "The faces of the people pushing this team's wagon look heavy. Data shows teams at this level average 2.60 in happiness. Simply changing these expressions would completely transform how the wagon moves.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: `このチームのワゴンを押す人たちの表情が、今とても苦しそうです。データでは、このレベルのチームの93.5%が不幸な状態にあります（幸福度平均1.35）。この表情を変えることが、チームの最優先課題です。`, valueCommentEn: "The faces of the people pushing this team's wagon look very strained right now. Data shows 93.5% of teams at this level are in an unhappy state (happiness average 1.35). Changing these expressions is the team's top priority.", ctaComment: "", ctaCommentEn: "" },
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
  return {
    main: isEn
      ? `"${categoryName}" is your team's greatest strength. Score ${score} shows this team has built something that most organizations can't easily replicate.`
      : `「${categoryName}」がこのチームの最大の推進力です。スコア${score}は、チームがこの領域で本質的な力を持っていることを示しています。`,
    locked: "",
  };
}

export function getImprovementComment(categoryName: string, score: string, isEn: boolean): { main: string; locked: string } {
  return {
    main: isEn
      ? `"${categoryName}" is where your team has the most room to grow. Score ${score} suggests there may be a hidden challenge here worth exploring.`
      : `「${categoryName}」がチームの成長の余地です。スコア${score}は、ここに何らかの見えにくい課題が潜んでいる可能性を示しています。`,
    locked: "",
  };
}

export function getGapComment(categoryName: string, isEn: boolean): { main: string; data: string; locked: string } {
  return {
    main: isEn
      ? `There is a significant gap in how team members perceive "${categoryName}". Even within the same team, people can see very different landscapes. This doesn't mean anyone is wrong.`
      : `「${categoryName}」でメンバー間の認識に大きなズレがあります。同じチームにいても、見えている景色がこんなに違うことがあります。これは誰かが間違っているのではありません。`,
    data: isEn
      ? "Data from 120,000+ respondents shows that teams with larger perception gaps tend to have lower happiness scores."
      : "12万人のデータでは、このような認識ギャップが大きいチームほど幸福度スコアが下がりやすい傾向があります。",
    locked: "",
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
      ja: { main: "このチームのエンゲージメントは高い水準にあります。「エンゲージ型」のチームは、困難な状況でも力を発揮できる土台があります。", locked: "" },
      en: { main: "Your team's engagement is at a high level. 'Engaged' teams have the foundation to perform even in challenging situations.", locked: "" },
    },
    vision_driven: {
      ja: { main: "このチームは方向性への共感は高いのに、幸福度が伴っていない「理念先行型」の状態です。頑張っているのに報われていない感覚がチームのどこかにあるかもしれません。", locked: "" },
      en: { main: "Your team has strong alignment with direction, but happiness hasn't caught up — this is what we call a 'Vision-Driven' state. There may be a sense somewhere in the team of working hard without feeling rewarded.", locked: "" },
    },
    action_driven: {
      ja: { main: "このチームは今の仕事は楽しめているものの、「なんのためにやっているか」がやや見えにくい「実行先行型」の状態です。", locked: "" },
      en: { main: "Your team enjoys the work itself, but the sense of purpose — 'why are we doing this?' — may be a little unclear. This is what we call an 'Action-Driven' state.", locked: "" },
    },
    at_risk: {
      ja: { main: "このチームは今、少し疲れている状態かもしれません。でも、このサーベイに全員が答えてくれたことは、チームに「向き合う力」がある証拠です。", locked: "" },
      en: { main: "Your team may be feeling a little tired right now. But the fact that everyone completed this survey is proof that your team has the courage to face itself.", locked: "" },
    },
  };
  return isEn ? comments[quadrant].en : comments[quadrant].ja;
}
