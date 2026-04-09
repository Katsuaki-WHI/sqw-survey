// ==============================
// カテゴリ名マスターデータ
// ==============================
export const CATEGORY_LABELS: Record<string, { ja: string; en: string; icon: string }> = {
  landscape:  { ja: "景色（ミッション）", en: "Landscape (Mission)", icon: "\uD83C\uDFD4\uFE0F" },
  road:       { ja: "道筋（戦略）", en: "Path (Strategy)", icon: "\uD83D\uDDFA\uFE0F" },
  rope:       { ja: "ロープ（リーダーシップ）", en: "Rope (Leadership)", icon: "\uD83E\uDDED" },
  tire:       { ja: "タイヤ（仕組み）", en: "Wheels (Structure)", icon: "\u2699\uFE0F" },
  body:       { ja: "押す人の体（能力・意欲）", en: "Body (Capability & Motivation)", icon: "\uD83D\uDCAA" },
  attitude:   { ja: "押す人の態度（風土・文化）", en: "Attitude (Culture & Climate)", icon: "\uD83E\uDD1D" },
  cargo:      { ja: "積荷（リソース・強み）", en: "Cargo (Resources & Strengths)", icon: "\uD83C\uDF92" },
  diversity:  { ja: "登場人物の多彩さ（多様性）", en: "Cast of Characters (Diversity)", icon: "\uD83C\uDF08" },
  happiness:  { ja: "幸福度", en: "Happiness", icon: "\uD83D\uDE0A" },
};

// ==============================
// 強みコメント
// ==============================
export function getStrengthComment(categoryName: string, score: string, isEn: boolean): { main: string; locked: string } {
  if (isEn) {
    return {
      main: `The greatest driving force of this team is '${categoryName}'. A score of ${score} shows that your team has genuine strength in this area.`,
      locked: `The AI Report will tell you exactly when and how this strength shines brightest, and specific actions to develop it further.`,
    };
  }
  return {
    main: `このチームの最大の推進力は「${categoryName}」です。スコア${score}は、チームがこの領域で本質的な力を持っていることを示しています。`,
    locked: `AIレポートでは、この強みがチームのどんな場面で最も活きているか、さらに伸ばすための具体的なアクションをお伝えします。`,
  };
}

// ==============================
// 改善コメント
// ==============================
export function getImprovementComment(categoryName: string, score: string, isEn: boolean): { main: string; locked: string } {
  if (isEn) {
    return {
      main: `'${categoryName}' is where your team has the most room to grow. A score of ${score} suggests there may be some hidden challenge here.`,
      locked: `The AI Report will present hypotheses about why this score occurred and give you specific improvement actions you can start tomorrow.`,
    };
  }
  return {
    main: `「${categoryName}」がチームの成長の余地です。スコア${score}は、ここに何らかの見えにくい課題が潜んでいる可能性を示しています。`,
    locked: `AIレポートでは、なぜこのスコアになっているのかAIが仮説を提示し、明日からできる具体的な改善アクションをお伝えします。`,
  };
}

// ==============================
// ギャップコメント
// ==============================
export function getGapComment(categoryName: string, isEn: boolean): { main: string; data: string; locked: string } {
  if (isEn) {
    return {
      main: `There is a significant gap in how team members perceive '${categoryName}'. Even within the same team, people can see very different landscapes. This doesn't mean anyone is wrong.`,
      data: `Data from 120,000+ respondents shows that teams with larger perception gaps tend to have lower happiness scores.`,
      locked: `The AI Report will explain the nature of this gap and provide a facilitation guide for safe team dialogue.`,
    };
  }
  return {
    main: `「${categoryName}」でメンバー間の認識に大きなズレがあります。同じチームにいても、見えている景色がこんなに違うことがあります。これは誰かが間違っているのではありません。`,
    data: `12万人のデータでは、このような認識ギャップが大きいチームほど幸福度スコアが下がりやすい傾向があります。`,
    locked: `AIレポートでは、このギャップの正体とチームで安全に対話するためのファシリテーションガイドをお伝えします。`,
  };
}

// ==============================
// 総括コメント（エンゲージメント4象限）
// ==============================
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
      ja: {
        main: "このチームのエンゲージメントは高い水準にあります。「エンゲージ型」のチームは、困難な状況でも力を発揮できる土台があります。",
        locked: "AIレポートでは、この状態をさらに高めるチーム固有のアクションプランをお伝えします。",
      },
      en: {
        main: "Your team's engagement is at a high level. 'Engaged' teams have the foundation to perform even in challenging situations.",
        locked: "The AI Report will provide a team-specific action plan to take your engagement even higher.",
      },
    },
    vision_driven: {
      ja: {
        main: "このチームは方向性への共感は高いのに、幸福度が伴っていない「理念先行型」の状態です。頑張っているのに報われていない感覚がチームのどこかにあるかもしれません。",
        locked: "AIレポートでは、この状態の原因とチームの熱量を回復させる具体的な方法をお伝えします。",
      },
      en: {
        main: "Your team has strong alignment with direction, but happiness hasn't caught up — this is what we call a 'Vision-Driven' state. There may be a sense somewhere in the team of working hard without feeling rewarded.",
        locked: "The AI Report will identify the cause and provide specific ways to restore your team's energy.",
      },
    },
    action_driven: {
      ja: {
        main: "このチームは今の仕事は楽しめているものの、「なんのためにやっているか」がやや見えにくい「実行先行型」の状態です。",
        locked: "AIレポートでは、チームの目的意識を高める対話テーマと具体的なアクションをお伝えします。",
      },
      en: {
        main: "Your team enjoys the work itself, but the sense of purpose — 'why are we doing this?' — may be a little unclear. This is what we call an 'Action-Driven' state.",
        locked: "The AI Report will provide dialogue themes and specific actions to strengthen your team's sense of purpose.",
      },
    },
    at_risk: {
      ja: {
        main: "このチームは今、少し疲れている状態かもしれません。でも、このサーベイに全員が答えてくれたことは、チームに「向き合う力」がある証拠です。",
        locked: "AIレポートでは、今すぐできる小さくて確実な改善アクションをお伝えします。",
      },
      en: {
        main: "Your team may be feeling a little tired right now. But the fact that everyone completed this survey is proof that your team has the courage to face itself.",
        locked: "The AI Report will give you small but certain improvement actions you can take right now.",
      },
    },
  };

  return isEn ? comments[quadrant].en : comments[quadrant].ja;
}
