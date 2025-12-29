// 価値観診断の質問
export const valueQuestions = [
  {
    id: 1,
    question: 'デザインをする上で、最も大切にしていることは何ですか？',
    placeholder: '例：クライアントの期待を超える提案をすること',
  },
  {
    id: 2,
    question: 'どんなデザイナーになりたいですか？（3年後の理想像）',
    placeholder: '例：高単価で信頼されるクライアントワークができるデザイナー',
  },
  {
    id: 3,
    question: 'デザイン以外で、人生において大切にしていることは何ですか？',
    placeholder: '例：家族との時間、自分の成長、社会への貢献',
  },
];

export type ValueAnswer = {
  questionId: number;
  answer: string;
};

