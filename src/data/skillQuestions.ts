// スキル診断用の質問データ
export interface SkillQuestion {
  id: number;
  category: 'design' | 'planning' | 'client' | 'business' | 'mindset';
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export const skillQuestions: SkillQuestion[] = [
  // 造形力（2問）
  {
    id: 1,
    category: 'design',
    question: 'Figma/Photoshop/Illustratorなどのデザインツールをどの程度使いこなせますか？',
    options: [
      { text: 'プロレベルで制作でき、他人に教えられる', score: 20 },
      { text: '一通りの機能を使いこなせる', score: 15 },
      { text: '基本的な操作はできる', score: 10 },
      { text: 'まだ学習中', score: 5 },
    ],
  },
  {
    id: 2,
    category: 'design',
    question: '最新のデザイントレンドをどの程度キャッチアップしていますか？',
    options: [
      { text: '常に最新情報を追い、作品に反映している', score: 20 },
      { text: '定期的にチェックしている', score: 15 },
      { text: 'たまに見る程度', score: 10 },
      { text: 'あまり意識していない', score: 5 },
    ],
  },

  // 設計力（2問）
  {
    id: 3,
    category: 'planning',
    question: 'ターゲットユーザーのペルソナや導線を考えてデザインしていますか？',
    options: [
      { text: '常に綿密に設計している', score: 20 },
      { text: '意識して設計している', score: 15 },
      { text: '基本的なことは考えている', score: 10 },
      { text: 'あまり考えていない', score: 5 },
    ],
  },
  {
    id: 4,
    category: 'planning',
    question: '複雑な情報を整理して、わかりやすく伝える自信は？',
    options: [
      { text: 'とても得意', score: 20 },
      { text: 'ある程度できる', score: 15 },
      { text: 'まだ苦手', score: 10 },
      { text: '難しいと感じる', score: 5 },
    ],
  },

  // CW力（2問）
  {
    id: 5,
    category: 'client',
    question: 'クライアントの要望を引き出し、提案する力は？',
    options: [
      { text: '要望以上の提案ができる', score: 20 },
      { text: '要望を正確に汲み取れる', score: 15 },
      { text: '基本的なやり取りはできる', score: 10 },
      { text: 'まだ不安がある', score: 5 },
    ],
  },
  {
    id: 6,
    category: 'client',
    question: 'クライアントからの修正依頼に対して、スムーズに対応できますか？',
    options: [
      { text: '常に柔軟かつ迅速に対応している', score: 20 },
      { text: 'だいたい対応できる', score: 15 },
      { text: '時々戸惑うことがある', score: 10 },
      { text: '苦手意識がある', score: 5 },
    ],
  },

  // ビジネス力（2問）
  {
    id: 7,
    category: 'business',
    question: '適切な価格設定や見積もりができますか？',
    options: [
      { text: '自信を持って提示できる', score: 20 },
      { text: 'ある程度できる', score: 15 },
      { text: 'まだ不安がある', score: 10 },
      { text: 'ほとんどわからない', score: 5 },
    ],
  },
  {
    id: 8,
    category: 'business',
    question: 'デザインがクライアントのビジネス成果にどう貢献するか意識していますか？',
    options: [
      { text: '常に意識し、数値目標も設定している', score: 20 },
      { text: '意識している', score: 15 },
      { text: '少し意識している', score: 10 },
      { text: 'あまり意識していない', score: 5 },
    ],
  },

  // マインド力（3問）
  {
    id: 9,
    category: 'mindset',
    question: 'デザインスキル向上のために、継続的に学習していますか？',
    options: [
      { text: '毎日学習している', score: 20 },
      { text: '週に数回学習している', score: 15 },
      { text: '月に数回学習している', score: 10 },
      { text: 'たまに学習する程度', score: 5 },
    ],
  },
  {
    id: 10,
    category: 'mindset',
    question: '明確な目標を設定し、計画的に行動していますか？',
    options: [
      { text: '明確な目標があり、着実に実行している', score: 20 },
      { text: '目標はあり、ある程度実行している', score: 15 },
      { text: '漠然とした目標はある', score: 10 },
      { text: '目標設定が苦手', score: 5 },
    ],
  },
  {
    id: 11,
    category: 'mindset',
    question: '壁にぶつかった時、どのように乗り越えますか？',
    options: [
      { text: '自分で解決策を見つけ、前進できる', score: 20 },
      { text: '助けを借りながら乗り越えられる', score: 15 },
      { text: '時間はかかるが乗り越えられる', score: 10 },
      { text: '挫折しやすい', score: 5 },
    ],
  },
];

export const skillCategoryNames = {
  design: '造形力',
  planning: '設計力',
  client: 'CW力',
  business: 'ビジネス力',
  mindset: 'マインド力',
};

// スコアを100点満点に換算する関数
export function calculateSkillScore(answers: Record<number, number>): {
  design: number;
  planning: number;
  client: number;
  business: number;
  mindset: number;
} {
  const categoryScores = {
    design: 0,
    planning: 0,
    client: 0,
    business: 0,
    mindset: 0,
  };

  const categoryQuestionCounts = {
    design: 0,
    planning: 0,
    client: 0,
    business: 0,
    mindset: 0,
  };

  // 各カテゴリのスコアを集計
  skillQuestions.forEach((question) => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      categoryScores[question.category] += answer;
      categoryQuestionCounts[question.category]++;
    }
  });

  // 各カテゴリを100点満点に換算
  const maxScorePerQuestion = 20;
  const result = {
    design: Math.round((categoryScores.design / (categoryQuestionCounts.design * maxScorePerQuestion)) * 100),
    planning: Math.round((categoryScores.planning / (categoryQuestionCounts.planning * maxScorePerQuestion)) * 100),
    client: Math.round((categoryScores.client / (categoryQuestionCounts.client * maxScorePerQuestion)) * 100),
    business: Math.round((categoryScores.business / (categoryQuestionCounts.business * maxScorePerQuestion)) * 100),
    mindset: Math.round((categoryScores.mindset / (categoryQuestionCounts.mindset * maxScorePerQuestion)) * 100),
  };

  return result;
}

