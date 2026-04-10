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
    top: { valueComment: `あなたの目には、ワゴンの行き先の景色がくっきりと輝いています。「なぜここで働くか」という問いに、あなた自身の誇りある答えを持っている状態です。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の95%が幸福度も高い状態にあります。`, valueCommentEn: `In your eyes, the landscape ahead of your wagon is shining brightly. You have your own proud answer to "why I work here." Data from ${DATA_STATS.respondentsDisplay} shows 95% of people at this level also have high happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、ワゴンの行き先の景色がよく見えており、その方向へ誇りを持って進んでいます。目指す先への共感が、あなたの働く力の源になっています。", valueCommentEn: "In your eyes, the landscape ahead of your wagon is clear, and you're moving toward it with pride. Your resonance with the destination is the source of your working energy.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `あなたの目には、ワゴンの行き先の景色が少し霞んで見えているかもしれません。${DATA_STATS.respondentsDisplay}のデータでは、この「景色」カテゴリが幸福度と最も強く連動しています。景色が鮮明になると、ワゴンを押す力が大きく変わります。`, valueCommentEn: `In your eyes, the destination of your wagon may look a little hazy. Data from ${DATA_STATS.respondentsDisplay} shows this Landscape category has the strongest connection to happiness. When the view becomes clearer, your energy to push the wagon changes dramatically.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、ワゴンがどこへ向かっているのか見えにくくなっているかもしれません。霧の中でも前に進もうとしているあなたの力は本物です。データでは、この景色カテゴリを高めることが幸福度に最も大きな影響を与えます。", valueCommentEn: "It may seem to you that the wagon is losing sight of where it's headed. But the strength you show — moving forward even through the fog — is real. Data shows improving this Landscape category has the greatest impact on happiness.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、ワゴンの行き先が全く見えない状態かもしれません。「なぜここで働いているのか」という問いが、心の中にあるかもしれません。それは弱さではなく、あなたが本気でこの旅に向き合っているサインです。", valueCommentEn: `It may seem to you that the wagon has no visible destination at all. You might be asking "why am I on this journey?" That is not weakness — it is a sign that you care deeply about where you are going.`, ctaComment: "", ctaCommentEn: "" },
  },

  road: {
    top: { valueComment: `あなたの目には、ワゴンが走る道が整備された石畳のようにスムーズに映っています。チームの戦略という「道」を信頼して、迷わず前へ進める状態です。${DATA_STATS.respondentsDisplay}のデータでも、戦略への共感が高い人ほど幸福度が高い傾向があります。`, valueCommentEn: `In your eyes, the road your wagon travels looks smooth, like well-laid cobblestone. You trust the team's strategy as your "road" and can move forward without hesitation. Data from ${DATA_STATS.respondentsDisplay} shows people with high strategic alignment tend to have higher happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、ワゴンが走る道が見えており、その道を信頼して進んでいます。データでも、戦略への共感が高い人は仕事への確信感も高い傾向があります。", valueCommentEn: "In your eyes, the road is visible and you trust it as you move forward. Data shows people with strong strategic alignment tend to have greater confidence in their work.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `あなたの目には、ワゴンが走る道が一部舗装されていない部分があるように見えているかもしれません。${DATA_STATS.respondentsDisplay}のデータでは、戦略への共感が深まると仕事のやりがいも大きく変わることが確認されています。`, valueCommentEn: `It may seem to you that the road has some unpaved sections. Data from ${DATA_STATS.respondentsDisplay} confirms that when strategic alignment deepens, your sense of purpose changes significantly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、ワゴンが走る道に疑問を感じているかもしれません。「本当にこの道でいいのか」という問いは、あなたが旅を真剣に考えている証です。データでは、このカテゴリが低いと幸福度にも影響が出やすいことが確認されています。", valueCommentEn: `It may seem to you that the road is questionable. Asking "is this really the right road?" is a sign that you take the journey seriously. Data confirms this category, when low, tends to affect happiness.`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、ワゴンが走る道が見えず、迷子になっている感覚があるかもしれません。データでは、このカテゴリが最も低い人は幸福度も大きく低下しています。あなたの感覚は正直で、大切なシグナルです。", valueCommentEn: "It may feel to you like the wagon is lost, with no visible road. Data shows people at the lowest level here also experience significant drops in happiness. Your feelings are honest and important signals.", ctaComment: "", ctaCommentEn: "" },
  },

  rope: {
    top: { valueComment: `あなたの目には、ロープがピンと張っており、リーダーの方向感がしっかりと伝わっています。指導・承認・目標提示が機能しており、「自分に期待されていること」も明確に見えています。${DATA_STATS.respondentsDisplay}のデータでも、このカテゴリが高い人はチームへの貢献感も高い傾向があります。`, valueCommentEn: `In your eyes, the rope is taut and the leader's direction is being transmitted clearly. Guidance, recognition, and goal-setting are working, and "what is expected of me" is clearly visible. Data from ${DATA_STATS.respondentsDisplay} shows people with high scores here tend to have a stronger sense of contribution.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、ロープがしっかりと機能しており、リーダーとの関係が安定しています。データでも、リーダーの関わりが高い人は仕事への安心感と幸福度が高い傾向があります。", valueCommentEn: "In your eyes, the rope is working well and your relationship with the leader is stable. Data shows people with strong leader engagement tend to have greater work confidence and happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `あなたの目には、ロープが少したるんでいるように感じているかもしれません。「もう少し指導や承認がほしい」「目標がもう少し明確なら」という感覚があるかもしれません。${DATA_STATS.respondentsDisplay}のデータでは、リーダーシップカテゴリと幸福度の相関（r=0.647）が確認されています。`, valueCommentEn: `It may seem to you that the rope has a bit of slack. You might feel "I'd like a bit more guidance or recognition" or "clearer goals would help." Data from ${DATA_STATS.respondentsDisplay} confirms a correlation (r=0.647) between leadership and happiness.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、ロープが大きくたるんでおり、リーダーとの距離を感じているかもしれません。「評価されていない」「目標が見えない」「期待されていることがわからない」という感覚があるかもしれません。", valueCommentEn: `It may seem to you that the rope is quite slack and you feel distance from your leader. You may feel "I'm not being recognized," "I can't see the goal," or "I don't know what's expected of me."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、ロープが機能しておらず、リーダーとワゴンが別々に動いているような状態に見えているかもしれません。一人で抱え込まず、この状況を言語化することが第一歩です。", valueCommentEn: "It may seem to you that the rope is not functioning at all — the leader and the wagon may be moving separately. The first step is not carrying this alone, but putting the situation into words.", ctaComment: "", ctaCommentEn: "" },
  },

  tire: {
    top: { valueComment: "あなたの目には、ワゴンのタイヤが丸く整っており、スムーズに転がっています。公正な評価・自律的に動ける範囲・前例にとらわれない姿勢——この3つが揃って見えています。このカテゴリが高い人は、変化への適応力も高い傾向があります。", valueCommentEn: "In your eyes, the wagon's wheels are round and smooth, rolling easily. Fair evaluation, room for autonomous action, and freedom from precedent — all three are in place. People with high scores here tend to adapt to change more effectively.", ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、タイヤがほぼ丸く、ワゴンが比較的スムーズに進んでいます。評価の仕組みが機能しており、自律的に動ける環境が整っています。", valueCommentEn: "In your eyes, the wheels are nearly round and the wagon moves relatively smoothly. The evaluation system is working and you have room to act autonomously.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `あなたの目には、タイヤが少し四角くなっているように見えているかもしれません。「評価が不明確」「前例に縛られている」という感覚が部分的にあるかもしれません。${DATA_STATS.respondentsDisplay}のデータでは、このカテゴリの改善が幸福度に影響することが確認されています。`, valueCommentEn: `It may seem to you that the wheels are getting a little square. You may partially feel that evaluation is unclear or that you are bound by precedent. Data from ${DATA_STATS.respondentsDisplay} confirms improving this category affects happiness.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、タイヤがかなり四角くなっており、ワゴンが進むたびにガタガタしているように感じているかもしれません。「頑張っているのに正当に評価されない」「前例に縛られて動きにくい」という感覚があるかもしれません。", valueCommentEn: `It may seem to you that the wheels are quite square, making the wagon bump with every turn. You may feel "I'm not being fairly evaluated despite my efforts" or "I'm constrained by precedent."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、タイヤが完全に四角くなっており、ワゴンが前に進むのに大きな抵抗があるように感じているかもしれません。仕組みや慣習が、あなたの力を活かせない状態にしています。", valueCommentEn: "It may seem to you that the wheels are completely square, creating great resistance to moving forward. Systems and conventions may be preventing your strength from being fully utilized.", ctaComment: "", ctaCommentEn: "" },
  },

  body: {
    top: { valueComment: `あなたには、ワゴンを押す力が充実しており、適した場所で・好きな仕事で・仲間に応援されながら力強く動けている感覚があります。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方は仕事への没入感も高い傾向があります。`, valueCommentEn: `You feel that you're pushing the wagon with full strength — in the right place, doing work you love, cheered on by teammates. Data from ${DATA_STATS.respondentsDisplay} shows people at this level tend to experience greater work engagement.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたには、ワゴンを押す力が充実しており、自分の強みを活かせている実感があります。成長への意欲も保たれており、ワゴンが確実に前へ進んでいます。", valueCommentEn: "You feel that you're pushing the wagon with plenty of strength, with a sense of utilizing your strengths. Your motivation for growth is maintained and the wagon is steadily moving forward.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "あなたには、ワゴンを押す力はあるのに、まだ全部は使えていない感覚があるかもしれません。「好きな仕事をもっとしたい」「適した場所で力を発揮したい」という感覚は、伸びしろのサインです。", valueCommentEn: `You may feel that you have the strength to push the wagon, but it's not fully coming through yet. The sense of "I want to do more of what I love" or "I want to use my strengths in the right place" is a sign of potential waiting to unfold.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたには、ワゴンを押す力があるのに、それが活かされていないもどかしさがあるかもしれません。「適した場所にいない」「好きや得意が活かせていない」「応援してくれる人が少ない」という感覚があるかもしれません。", valueCommentEn: `You may feel the frustration of having the strength to push the wagon but not being able to use it fully. You may feel "I'm not in the right place," "my passions and strengths aren't being utilized," or "I don't have enough people supporting me."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたには、ワゴンを押す力がまだ眠ったままになっているかもしれません。適材適所でなく・好きや得意が活かせず・応援してくれる人もいない状態は、大きなエネルギーの消耗につながります。あなたの力は本物です。", valueCommentEn: "You may feel that your strength to push the wagon is still asleep. Not being in the right place, not being able to use your passions and strengths, and not having people who support you — this combination drains enormous energy. But your strength is real.", ctaComment: "", ctaCommentEn: "" },
  },

  attitude: {
    top: { valueComment: `あなたの目には、ワゴンを押す人たちの表情が生き生きと輝いています。協力し合い・尊重し合い・意見を言い合える環境——これを感じられているあなたは、とても恵まれた状態にいます。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の95%以上が幸福度も高い状態にあります。`, valueCommentEn: `In your eyes, the faces of the people pushing the wagon are bright and alive. You feel an environment of cooperation, respect, and open expression — and that makes you truly fortunate. Data from ${DATA_STATS.respondentsDisplay} shows over 95% of people at this level also have high happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、ワゴンを押す人たちの表情が穏やかに映っており、チームの雰囲気が良い状態です。このカテゴリは幸福度と最も強く連動するカテゴリの一つです。", valueCommentEn: "In your eyes, the faces of the people pushing the wagon look calm and the team atmosphere is good. This category is one of the strongest drivers of happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "あなたの目には、ワゴンを押す人たちの表情が少し疲れて見えるかもしれません。「もう少し協力し合えれば」「もう少し認め合えれば」という感覚があるかもしれません。このカテゴリは幸福度に最も大きな影響を与えます。", valueCommentEn: `It may seem to you that the faces of the people pushing the wagon look a little tired. You might feel "if only we could collaborate more" or "if only we recognized each other more." This category has the greatest impact on happiness.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、ワゴンを押す人たちの表情が重そうに見えています。データでは、このカテゴリが低いと81%のメンバーが幸福度も低い状態にあります。「認められていない」「意見が言いにくい」という感覚があるかもしれません。", valueCommentEn: `In your eyes, the faces of the people pushing the wagon look heavy. Data shows 81% of members with low scores here also have low happiness. You may feel "I'm not being recognized" or "it's hard to voice my opinions."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、ワゴンを押す人たちの表情が今とても苦しそうに見えています。データでは、このカテゴリが最低レベルのチームの93.5%が不幸な状態にあります。あなたが今感じているしんどさは、データが示す通りの現実です。", valueCommentEn: "In your eyes, the faces of the people pushing the wagon look very strained right now. Data shows 93.5% of teams at the lowest level are in an unhappy state. The difficulty you feel right now is a reality that the data confirms.", ctaComment: "", ctaCommentEn: "" },
  },

  cargo: {
    top: { valueComment: `あなたの目には、ワゴンの積荷に旅に必要な装備が揃っています。「仲間のことを深く知っている地図」「外の世界とのネットワーク」「最新の道具を使いこなす力」——これらを感じられている状態です。${DATA_STATS.respondentsDisplay}のデータでも、このスコアの方は幸福度が高い傾向があります。`, valueCommentEn: `In your eyes, the wagon's cargo holds everything needed for the journey — a deep map of teammates, external networks, and mastery of the latest tools. You can feel all of these. Data from ${DATA_STATS.respondentsDisplay} shows people at this level tend to have higher happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、ワゴンの積荷が充実しています。仲間の強み弱みを理解し、外部リソースを活用し、新技術も取り入れられているように見えています。", valueCommentEn: "In your eyes, the wagon's cargo is well-stocked. You see that the team understands each other's strengths and weaknesses, leverages external resources, and incorporates new technologies.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "あなたの目には、ワゴンの積荷がまだ十分に揃っていないかもしれません。「仲間のことをもっと知りたい」「外のネットワークをもっと活かしたい」「新しい技術をもっと取り入れたい」という感覚があるかもしれません。", valueCommentEn: `It may seem to you that the wagon's cargo is not fully stocked yet. You may feel "I want to know my teammates better," "I want to leverage external networks more," or "I want to incorporate new technologies more."`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、ワゴンの積荷が薄く、旅の装備が心もとない状態に見えているかもしれません。「仲間のことが十分にわかっていない」「外の世界とのつながりが少ない」という感覚があるかもしれません。", valueCommentEn: `It may seem to you that the wagon's cargo is thin and the equipment feels insufficient. You may feel "I don't know my teammates well enough" or "we have few connections to the outside world."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、ワゴンの積荷がほとんど空の状態に見えているかもしれません。仲間への相互理解・外部とのつながり・最新技術の活用、いずれも機能していないと感じているかもしれません。まず「仲間を知ること」が最初の一歩です。", valueCommentEn: `It may seem to you that the wagon's cargo is nearly empty. You may feel that mutual understanding, external connections, and new technology utilization are all not functioning. The first step is simply "getting to know your teammates."`, ctaComment: "", ctaCommentEn: "" },
  },

  diversity: {
    top: { valueComment: `あなたの目には、ワゴンの旅に個性豊かな登場人物たちが集まり、それぞれが堂々と舞台に立っています。${DATA_STATS.respondentsDisplay}のデータでは、このスコアの方の96.7%が幸福度も高い状態にあります。衝突を恐れずに意見をぶつけ合え、新しい価値が生まれていると感じられています。`, valueCommentEn: `In your eyes, characters full of individuality have gathered for the wagon's journey, each standing boldly on the stage. Data from ${DATA_STATS.respondentsDisplay} shows 96.7% of people at this level also have high happiness. You feel that new value is being born through fearless engagement.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたの目には、ワゴンの旅に個性豊かな仲間たちがいます。性別・年齢に関係なく適性が活かされ、それぞれが能力を発揮しているように見えています。この多彩さが、旅の可能性を広げています。", valueCommentEn: "In your eyes, the wagon's journey has companions with diverse individuality. Strengths are being utilized regardless of gender or age, and everyone is making full use of their capabilities. This diversity is expanding the possibilities of the journey.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: "あなたの目には、ワゴンの旅の登場人物たちが、まだ舞台の脇に立っているように見えているかもしれません。「もっと自分の個性を活かしたい」「もっと意見をぶつけ合えれば」という感覚があるかもしれません。", valueCommentEn: `It may seem to you that the characters on the wagon's journey are still standing in the wings. You may feel "I want to express my individuality more" or "I wish we could engage more openly."`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたの目には、ワゴンの旅で自分の個性や意見を出しにくい状態に見えているかもしれません。「衝突を避けがち」「自分の特性を発揮できていない」という感覚があるかもしれません。", valueCommentEn: `It may seem to you that it's hard to express your individuality or opinions on the wagon's journey. You may feel "we tend to avoid conflict" or "I'm not able to demonstrate my capabilities."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたの目には、ワゴンの旅で登場人物たちが個性を発揮できていない状態に見えているかもしれません。衝突を恐れ・意見をぶつけ合えず・新しい価値が生まれにくい環境は、旅のエネルギーを大きく奪います。", valueCommentEn: "It may seem to you that the characters on the wagon's journey cannot express their individuality. An environment where conflict is feared, opinions can't be shared, and new value is hard to create — this significantly drains the journey's energy.", ctaComment: "", ctaCommentEn: "" },
  },

  happiness: {
    top: { valueComment: `あなたは今、このチームで働いていて幸せを感じています。${DATA_STATS.respondentsDisplay}のデータで、幸福度が最も高い人の特徴は「チームへの誇り」が高いことです。あなたのこの幸せは、チームの成果にも確実につながっています。`, valueCommentEn: `You feel happy working in this team right now. Data from ${DATA_STATS.respondentsDisplay} shows the defining characteristic of the happiest people is high "pride in their team." Your happiness is definitely contributing to the team's performance.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "あなたは今、このチームで働いていて概ね幸せを感じています。データでも、幸福度が高い人はチームへの貢献感も高い傾向があります。", valueCommentEn: "You feel generally happy working in this team right now. Data shows people with higher happiness also tend to have a greater sense of contribution to the team.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `あなたは今、このチームで働いていて「まあまあ」という感覚かもしれません。${DATA_STATS.respondentsDisplay}のデータでは、幸福度を高める最大の要因は「チームへの誇り」と「風土・文化」であることが確認されています。`, valueCommentEn: `You may feel "so-so" about working in this team right now. Data from ${DATA_STATS.respondentsDisplay} confirms that the biggest factors in raising happiness are "pride in the team" and "culture & climate."`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "あなたは今、このチームで働いていて幸せを感じにくい状態かもしれません。データでは、幸福度が低い状態が続くと仕事への意欲にも影響が出やすいことが確認されています。今の状態を変えるためのヒントが、他のカテゴリのスコアに隠れています。", valueCommentEn: "You may find it hard to feel happy working in this team right now. Data confirms that when low happiness persists, it tends to affect work motivation. Hints for changing your current state are hidden in your other category scores.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "あなたは今、このチームで働いていてとても苦しい状態かもしれません。データでは、幸福度が最も低い状態の人のほとんどが「チームへの誇り」と「風土・文化」のスコアも低い状態にあります。今の状態を一人で抱え込まないでください。", valueCommentEn: "You may be feeling very strained working in this team right now. Data shows most people with the lowest happiness also have low scores in \"pride in team\" and \"culture & climate.\" Please don't carry this burden alone.", ctaComment: "", ctaCommentEn: "" },
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
    top: { valueComment: `このチームのワゴンが走る道が、しっかりと整備されています。戦略を信頼して、チーム全員が迷わず同じ方向へ進んでいます。${DATA_STATS.teamsDisplay}のデータでも、戦略への共感が高いチームほど成果と幸福度が両立している傾向があります。`, valueCommentEn: `The road this team's wagon travels is well-maintained. The team trusts the strategy and everyone is moving confidently in the same direction. Data from ${DATA_STATS.teamsDisplay} shows teams with high strategic alignment tend to achieve both performance and happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: `このチームのワゴンが走る道がよく見えており、戦略への共感がチームの推進力になっています。データでも、戦略カテゴリが高いチームは変化への対応力も高い傾向があります。`, valueCommentEn: "The road this team's wagon travels is clearly visible and strategic alignment is driving the team forward. Data shows teams with high strategy scores also tend to be more resilient to change.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのワゴンが走る道が、一部整備されていない部分があるかもしれません。戦略への共感に個人差がある可能性があります。${DATA_STATS.teamsDisplay}のデータでは、全員が「この道でいこう」と思えると、チームの推進力が大きく変わることが確認されています。`, valueCommentEn: `The road this team's wagon travels may have some unmaintained sections. There may be individual differences in strategic alignment. Data from ${DATA_STATS.teamsDisplay} confirms that when everyone aligns on direction, team momentum changes significantly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンが走る道に、疑問を持っているメンバーが多いかもしれません。データでは、戦略カテゴリが低いチームほど幸福度も成果も低くなる傾向があります。道への不信は、チームのエネルギーを静かに奪います。", valueCommentEn: `Many members may be questioning the road this team's wagon is on. Data shows teams with low strategy scores tend to have lower happiness and performance. Distrust in the road quietly drains the team's energy.`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのワゴンが走る道が見えず、迷走しているかもしれません。方向性への疑問や不信感が広がっている可能性があります。データでは、このスコアレベルのチームは幸福度も大きく低下しています。道を示すことが急務です。", valueCommentEn: "This team's wagon may be wandering without a visible road. Doubts and distrust about direction may be spreading. Data shows teams at this score level experience significant drops in happiness. Showing the way forward is urgent.", ctaComment: "", ctaCommentEn: "" },
  },
  rope: {
    top: { valueComment: `ロープがピンと張っており、リーダーの力がチーム全体にしっかりと伝わっています。指導・承認・明確な目標・期待の共有——これらが機能しているチームは、安心して前へ進めます。${DATA_STATS.teamsDisplay}のデータでも、このカテゴリが高いチームは幸福度平均が4.20を超えています。`, valueCommentEn: `The rope is taut and the leader's strength is being transmitted effectively. Guidance, recognition, clear goals, and shared expectations are working. Data from ${DATA_STATS.teamsDisplay} shows teams with high scores here average over 4.20 in happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "ロープがしっかりと機能しており、リーダーとメンバーの関係がワゴンの安定感につながっています。データでも、リーダーの関わりが高いチームはメンバーの幸福度も高い傾向があります。", valueCommentEn: "The rope is functioning well and the leader-member relationship is contributing to the wagon's stability. Data shows teams with strong leader engagement also tend to have higher member happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `ロープが少したるんでいるかもしれません。「もう少しリーダーからの関わりがあれば」というメンバーの声があるかもしれません。${DATA_STATS.teamsDisplay}のデータでは、リーダーシップカテゴリと幸福度の相関（r=0.709）が確認されています。ロープが張れば、ワゴンはもっとスムーズに進みます。`, valueCommentEn: `The rope may have some slack. Some members may be thinking "a little more leader engagement would help." Data from ${DATA_STATS.teamsDisplay} confirms a correlation (r=0.709) between leadership and happiness. When the rope is taut, the wagon moves more smoothly.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "ロープが大きくたるんでおり、リーダーとワゴンの間に距離感があるかもしれません。データでは、このカテゴリが低いチームの幸福度平均は2.71と低い状態にあります。このカテゴリはチームの幸福度と成果の両方に影響します。", valueCommentEn: "The rope may be quite slack with growing distance between the leader and the wagon. Data shows teams with low scores here average 2.71 in happiness. This category affects both team happiness and performance.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "ロープが機能しておらず、リーダーとチームが別々に動いている状態かもしれません。データでは、このレベルのチームの幸福度平均は2.20以下と非常に低い状態にあります。早急な対応が必要な状態です。", valueCommentEn: "The rope may not be functioning at all with the leader and team moving separately. Data shows teams at this level average below 2.20 in happiness — very low. Urgent action is needed.", ctaComment: "", ctaCommentEn: "" },
  },
  tire: {
    top: { valueComment: `このチームのワゴンのタイヤが丸く整っており、スムーズに走っています。公正な評価・自律的に動ける範囲・前例にとらわれない姿勢——この3つが揃ったチームは、変化にも機動的に対応できます。${DATA_STATS.teamsDisplay}のデータでも、このカテゴリが高いチームの幸福度平均は4.33です。`, valueCommentEn: `This team's wagon wheels are round and smooth, rolling easily. Fair evaluation, room for autonomous action, and freedom from precedent — a team with all three can respond agilely to change. Data from ${DATA_STATS.teamsDisplay} shows teams with high scores here average 4.33 in happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのタイヤがほぼ丸く、ワゴンが比較的スムーズに進んでいます。仕組みが機能しており、チームが自律的に動けています。データでも、仕組みカテゴリが高いチームは成果と幸福度が両立している傾向があります。", valueCommentEn: "This team's wheels are nearly round and the wagon moves relatively smoothly. Systems are functioning and the team can operate autonomously. Data shows teams with high structure scores tend to achieve both performance and happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのタイヤが少し四角くなっているかもしれません。「評価が不明確」「前例に縛られている」と感じているメンバーがいる可能性があります。${DATA_STATS.teamsDisplay}のデータでは、このカテゴリの改善が幸福度と成果の両方に影響することが確認されています。`, valueCommentEn: `This team's wheels may be getting a little square. Some members may feel evaluation is unclear or that they are bound by precedent. Data from ${DATA_STATS.teamsDisplay} confirms that improving this category affects both happiness and performance.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのタイヤがかなり四角くなっており、ワゴンが進むたびにガタガタしている状態かもしれません。データでは、このカテゴリが低いチームの幸福度平均は2.81と低い状態にあります。「頑張っているのに報われない」という声がチーム内にあるかもしれません。", valueCommentEn: `This team's wheels may be quite square making the wagon bump along with every turn. Data shows teams with low scores here average 2.81 in happiness. There may be voices in the team saying "despite our efforts it doesn't pay off."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのタイヤが完全に四角くなっており、ワゴンが前に進むのに大きな抵抗がある状態かもしれません。仕組みや慣習がチームの足かせになっている可能性があります。データでは、このレベルのチームの幸福度は非常に低い状態にあります。早急な改善が必要です。", valueCommentEn: "This team's wheels may be completely square creating great resistance to moving forward. Systems and conventions may be shackling the team. Data shows teams at this level have very low happiness. Urgent improvement is needed.", ctaComment: "", ctaCommentEn: "" },
  },
  body: {
    top: { valueComment: `このチームのワゴンを押す人たちが、適した場所で・好きな役割で・仲間に応援されながら力強く動いています。適材適所・好き×得意・成長支援の3つが揃ったチームは、困難な課題にも立ち向かえます。${DATA_STATS.teamsDisplay}のデータでも、このカテゴリが高いチームの幸福度平均は4.39です。`, valueCommentEn: `The people pushing this team's wagon are in the right places, doing roles they love, cheered on by teammates. A team with right roles, passions and strengths utilized, and mutual support can take on any challenge. Data from ${DATA_STATS.teamsDisplay} shows teams with high scores here average 4.39 in happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンを押す力が充実しています。メンバーが適材適所で・好きと得意を活かして・互いに応援し合える環境で動いています。データでも、このカテゴリが高いチームは成長感と幸福度が高い傾向があります。", valueCommentEn: "The people pushing this team's wagon have plenty of strength. Members are in right roles, using their passions and strengths, with mutual support. Data shows teams with high scores here tend to have greater growth and happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのワゴンを押す力はあるのに、まだ全部は使えていない感覚があるかもしれません。${DATA_STATS.teamsDisplay}のデータでは、能力・意欲カテゴリと幸福度の相関（r=0.724）が確認されています。「もっとメンバーの強みを活かせれば」という感覚があるかもしれません。`, valueCommentEn: `This team has the strength to push the wagon, but it may not be fully coming through. Data from ${DATA_STATS.teamsDisplay} confirms a correlation (r=0.724) between capability and happiness. You may feel "if only we could better utilize members' strengths."`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンを押す人たちが、力を発揮しきれていない状態かもしれません。データでは、このカテゴリが低いチームの幸福度平均は2.83と低い状態にあります。「適材適所になっていない」「好きや得意が活かされていない」という状態かもしれません。", valueCommentEn: "The people pushing this team's wagon may not be fully expressing their strength. Data shows teams with low scores here average 2.83 in happiness. The team may have mismatched roles or underutilized passions and strengths.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのワゴンを押す人たちの力が大きく落ちているかもしれません。メンバーの強みが活かされず、意欲も低下している可能性があります。データでは、このレベルのチームの幸福度は非常に低い状態にあります。早急な対応が必要です。", valueCommentEn: "The strength of the people pushing this team's wagon may have dropped significantly. Members' strengths may not be utilized and motivation may be declining. Data shows teams at this level have very low happiness. Urgent action is needed.", ctaComment: "", ctaCommentEn: "" },
  },
  attitude: {
    top: { valueComment: `このチームのワゴンを押す人たちの表情が、生き生きと輝いています。${DATA_STATS.teamsDisplay}のデータで、このカテゴリはチームの幸福度と最も強く連動します（r=0.779）。スコアが高いチームの幸福度平均は4.36——この表情こそが、ワゴンを動かす最大の力です。`, valueCommentEn: `The faces of the people pushing this team's wagon are bright and alive. Across ${DATA_STATS.teamsDisplay}, this category has the strongest connection to team happiness (r=0.779). Teams scoring high here average 4.36 in happiness — these expressions are the greatest force moving the wagon.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンを押す人たちの表情が穏やかで、協力・尊重・質への姿勢が機能しています。このカテゴリはチームの幸福度と最も強く連動します。この表情が、ワゴンを前へ進める大きな力になっています。", valueCommentEn: "The faces of the people pushing this team's wagon are calm and collaboration, respect, and quality commitment are working. This category has the strongest connection to team happiness. These expressions are a great force propelling the wagon forward.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのワゴンを押す人たちの表情が、少し疲れて見えるかもしれません。${DATA_STATS.teamsDisplay}のデータで、このカテゴリはチームの幸福度と最も強く連動することが確認されています。表情が変わると、ワゴンの動きが大きく変わります。`, valueCommentEn: `The faces of the people pushing this team's wagon may look a little tired. Data from ${DATA_STATS.teamsDisplay} confirms this category has the strongest connection to team happiness. When these expressions change, how the wagon moves will change dramatically.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンを押す人たちの表情が重そうです。データでは、このスコアのチームの幸福度平均は2.60と低い状態にあります。表情が変わるだけで、ワゴンの動きは全く変わります。", valueCommentEn: "The faces of the people pushing this team's wagon look heavy. Data shows teams at this level average 2.60 in happiness. Simply changing these expressions would completely transform how the wagon moves.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: `このチームのワゴンを押す人たちの表情が、今とても苦しそうです。データでは、このレベルのチームの93.5%が不幸な状態にあります（幸福度平均1.35）。この表情を変えることが、チームの最優先課題です。`, valueCommentEn: "The faces of the people pushing this team's wagon look very strained right now. Data shows 93.5% of teams at this level are in an unhappy state (happiness average 1.35). Changing these expressions is the team's top priority.", ctaComment: "", ctaCommentEn: "" },
  },
  cargo: {
    top: { valueComment: `このチームのワゴンの積荷に、旅に必要な装備が揃っています。「仲間の強み弱みを知っている地図」「外部とのネットワーク」「最新のツールや技術の活用力」——この3つが揃ったチームは、外部の変化にも柔軟に対応できます。${DATA_STATS.teamsDisplay}のデータでも、このカテゴリが高いチームの幸福度平均は4.29です。`, valueCommentEn: `This team's wagon cargo holds all the equipment needed. A map of each member's strengths and weaknesses, external network connections, and the ability to leverage the latest tools — a team with all three can flexibly adapt. Data from ${DATA_STATS.teamsDisplay} shows teams with high scores here average 4.29 in happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンの積荷が充実しています。互いの強み弱みを理解し、外部リソースを活用し、新技術も取り入れられている状態です。データでも、このカテゴリが高いチームは対応力と幸福度が高い傾向があります。", valueCommentEn: "This team's wagon cargo is well-stocked. The team understands strengths and weaknesses, leverages external resources, and incorporates new technologies. Data shows teams with high scores here tend to have greater adaptability and happiness.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのワゴンの積荷が、まだ十分に揃っていないかもしれません。${DATA_STATS.teamsDisplay}のデータでは、積荷カテゴリと幸福度の相関（r=0.732）が確認されています。「互いの強み弱みをもっと理解できれば」「外部をもっと活かせれば」という感覚があるかもしれません。`, valueCommentEn: `This team's wagon cargo may not be fully stocked yet. Data from ${DATA_STATS.teamsDisplay} confirms a correlation (r=0.732) between cargo and happiness. You may feel "if only we understood each other better" or "if only we could leverage external resources more."`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンの積荷が薄く、旅の装備が心もとない状態かもしれません。データでは、このカテゴリが低いチームの幸福度平均は2.43と低い状態にあります。仲間への相互理解・外部との繋がり・新技術の活用、いずれも強化が必要かもしれません。", valueCommentEn: "This team's wagon cargo may be thin, leaving the equipment feeling insufficient. Data shows teams with low scores here average 2.43 in happiness. Mutual understanding, external connections, and new technology utilization may all need strengthening.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: `このチームのワゴンの積荷が、ほとんど空の状態かもしれません。データでは、このレベルのチームの93.8%が不幸な状態にあります。仲間への相互理解・外部とのつながり・最新技術の活用、いずれも機能していない状態は、チームの対応力を大きく奪います。`, valueCommentEn: `This team's wagon cargo may be nearly empty. Data shows 93.8% of teams at this level are in an unhappy state. When mutual understanding, external connections, and new technology utilization are all not functioning, the team's adaptability suffers greatly.`, ctaComment: "", ctaCommentEn: "" },
  },
  diversity: {
    top: { valueComment: `このチームのワゴンの旅に、個性豊かな登場人物たちが集まり、それぞれが堂々と舞台に立っています。衝突を恐れず意見をぶつけ合い、そこから新しい価値が生まれています。${DATA_STATS.teamsDisplay}のデータでも、このカテゴリが高いチームの幸福度は非常に高い状態にあります。`, valueCommentEn: `Characters full of individuality have gathered for this team's wagon journey, each standing boldly on the stage. They engage without fear of conflict and new value is being born. Data from ${DATA_STATS.teamsDisplay} shows teams with high scores here have very high happiness.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームのワゴンの旅に、多彩な個性の登場人物たちがいます。性別・年齢に関係なく適性が活かされ、それぞれが能力を発揮しています。データでも、多様性カテゴリが高いチームは幸福度と創造性が高い傾向があります。", valueCommentEn: "The team's wagon journey has characters with diverse individuality. Strengths are utilized regardless of gender or age and everyone is making full use of capabilities. Data shows teams with high diversity scores tend to have greater happiness and creativity.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのワゴンの旅の登場人物たちが、まだ舞台の脇に立っているかもしれません。${DATA_STATS.teamsDisplay}のデータでは、多様性カテゴリと幸福度の相関（r=0.756）が確認されています。「もう少し個々の個性が活かされれば」という感覚があるかもしれません。`, valueCommentEn: `The characters on this team's wagon journey may still be standing in the wings. Data from ${DATA_STATS.teamsDisplay} confirms a correlation (r=0.756) between diversity and happiness. You may feel "if only individual personalities could be better utilized."`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのワゴンの旅で、個性や意見が出にくい状態かもしれません。データでは、このカテゴリが低いチームほど幸福度が低くなる傾向があります。「衝突を避けがち」「自分の特性を発揮しにくい」という空気があるかもしれません。", valueCommentEn: `It may be hard to express individuality or opinions on this team's wagon journey. Data shows teams with lower diversity scores tend to have lower happiness. There may be an atmosphere of "we tend to avoid conflict" or "it's hard to demonstrate capabilities."`, ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: "このチームのワゴンの旅で、登場人物たちが個性を発揮できていない状態かもしれません。データでは、このレベルのチームの幸福度は大きく低下しています。衝突を恐れ・意見が出にくい環境は、チームの創造性と活力を大きく奪います。", valueCommentEn: "The characters on this team's wagon journey may not be able to express their individuality. Data shows teams at this level experience significant drops in happiness. An environment where conflict is feared and opinions are hard to share undermines team creativity and vitality.", ctaComment: "", ctaCommentEn: "" },
  },
  happiness: {
    top: { valueComment: `このチームは今、はたらく喜びに満ちています。${DATA_STATS.teamsDisplay}のデータで、幸福度が最高レベルのチームは「押す人の表情（風土・文化）」と「景色（目的と誇り）」の両方が高い傾向があります。この状態を大切に、さらに育てていきましょう。`, valueCommentEn: `This team is filled with the joy of work right now. Data from ${DATA_STATS.teamsDisplay} shows teams at the highest happiness level tend to have both strong Culture & Climate and Purpose & Pride. Cherish this state and nurture it further.`, ctaComment: "", ctaCommentEn: "" },
    high: { valueComment: "このチームは概ねはたらく喜びを感じています。データでも、幸福度が高いチームは成果も持続しやすい傾向があります。この土台の上に、さらなる成長を積み上げていきましょう。", valueCommentEn: "This team is experiencing a good level of joy in work. Data shows teams with high happiness also tend to sustain their performance. Build further growth on top of this foundation.", ctaComment: "", ctaCommentEn: "" },
    mid: { valueComment: `このチームのはたらく喜びは中程度の状態です。${DATA_STATS.teamsDisplay}のデータでは、幸福度を高める最大の要因は「押す人の表情（風土・文化）」と「景色（目的と誇り）」であることが確認されています。この2つに着目すると、変化が生まれやすくなります。`, valueCommentEn: `This team's joy of work is at a moderate level. Data from ${DATA_STATS.teamsDisplay} confirms the greatest drivers of happiness are Culture & Climate and Purpose & Pride. Focusing on these two creates the most change.`, ctaComment: "", ctaCommentEn: "" },
    low: { valueComment: "このチームのはたらく喜びが低めの状態です。データでは、幸福度が低いチームの93.5%が「押す人の表情（風土・文化）」も低い状態にあります。チームの空気を変えることが、最初の一歩です。", valueCommentEn: "This team's joy of work is low. Data shows 93.5% of teams with low happiness also have low Culture & Climate scores. Changing the team atmosphere is the first step.", ctaComment: "", ctaCommentEn: "" },
    bottom: { valueComment: `このチームのはたらく喜びが最も低いレベルにあります。${DATA_STATS.teamsDisplay}のデータでは、このレベルのチームの幸福度平均は1.35と非常に低い状態にあります。メンバーが今感じている苦しさは、データが示す通りの現実です。早急な対応が必要な状態です。`, valueCommentEn: `This team's joy of work is at the lowest level. Data from ${DATA_STATS.teamsDisplay} shows teams at this level average just 1.35 in happiness — very low. The difficulty members feel right now is exactly what the data shows. Urgent action is needed.`, ctaComment: "", ctaCommentEn: "" },
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
