import { DiagnosisExQuestion } from '../types/diagnosisEx';

export const diagnosisExQuestions: DiagnosisExQuestion[] = [
  {
    id: 1,
    category: 'values',
    question: 'あなたがデザインをする上で、最も大切にしている価値観は何ですか？',
    placeholder: '例：ユーザーの課題を解決すること、美しさと機能性の両立...',
    minLength: 50,
  },
  {
    id: 2,
    category: 'vision',
    question: 'デザイナーとして、3年後にどのような自分になっていたいですか？',
    placeholder: '例：クライアントから信頼される戦略的なデザイナー...',
    minLength: 50,
  },
  {
    id: 3,
    category: 'strength',
    question: 'あなたの強みや得意なデザイン領域は何ですか？具体的に教えてください。',
    placeholder: '例：ブランディング、UI/UXデザイン、ビジュアルデザイン...',
    minLength: 50,
  },
  {
    id: 4,
    category: 'challenge',
    question: '現在、デザイナーとして直面している課題や悩みは何ですか？',
    placeholder: '例：営業が苦手、単価が上がらない、技術力に自信がない...',
    minLength: 50,
  },
  {
    id: 5,
    category: 'style',
    question: 'あなたのデザインスタイルや、仕事の進め方の特徴を教えてください。',
    placeholder: '例：丁寧なヒアリングから始める、データ分析を重視する...',
    minLength: 50,
  },
];
