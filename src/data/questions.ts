import { DiagnosisQuestion, DesignerType, DesignerTypeInfo, SkillCategory } from '../types/diagnosis';

export const diagnosisQuestions: DiagnosisQuestion[] = [
  { id: 1, category: 'design', text: '街中の広告や看板を見て「このフォント選び、いいな」と思うことがある' },
  { id: 2, category: 'design', text: '配色を考えるとき、感覚的に「これだ」と決められることが多い' },
  { id: 3, category: 'design', text: '細部のあしらい（影、余白、角丸など）にこだわりたくなる' },
  { id: 4, category: 'design', text: '最新のデザイントレンドを意識的にチェックしている' },

  { id: 5, category: 'planning', text: 'デザインを作る前に、ユーザーがどう動くかを考えるのが好きだ' },
  { id: 6, category: 'planning', text: '「なぜこの配置なのか」を論理的に説明できる自信がある' },
  { id: 7, category: 'planning', text: '情報の優先順位を整理してから手を動かすことが多い' },
  { id: 8, category: 'planning', text: '見た目の美しさより「伝わるかどうか」を重視する傾向がある' },

  { id: 9, category: 'client', text: 'クライアントの曖昧な要望から、本当に求めていることを引き出せる' },
  { id: 10, category: 'client', text: '修正依頼が来ても、感情的にならず冷静に対応できる' },
  { id: 11, category: 'client', text: '「こうした方がいい」と思ったら、根拠を添えて提案できる' },
  { id: 12, category: 'client', text: '納期やスケジュールの調整を、相手に配慮しながら行える' },

  { id: 13, category: 'business', text: '自分のデザインの価値を金額で説明することに抵抗がない' },
  { id: 14, category: 'business', text: '新しい案件を獲得するために、自分から行動を起こせる' },
  { id: 15, category: 'business', text: 'デザインがクライアントの売上にどう貢献するか意識している' },
  { id: 16, category: 'business', text: 'SNSやポートフォリオで自分を発信することを継続できている' },

  { id: 17, category: 'mindset', text: 'うまくいかない時期があっても、学習や制作を続けられる' },
  { id: 18, category: 'mindset', text: '自分で決めた目標に向かって、計画的に行動できる' },
  { id: 19, category: 'mindset', text: '他人と比較して落ち込むより、自分の成長に目を向けられる' },
  { id: 20, category: 'mindset', text: '「まだまだ成長できる」と心から思えている' },
];

export const designerTypes: Record<DesignerType, DesignerTypeInfo> = {
  artist: {
    type: 'artist',
    name: 'アーティスト型',
    description: '美しいものを作ることに情熱を持つタイプ。ビジュアルのクオリティに妥協せず、見る人の心を動かすデザインを生み出します。',
    color: '#ef4444'
  },
  strategist: {
    type: 'strategist',
    name: 'ストラテジスト型',
    description: '論理と構造で課題を解決するタイプ。「なぜそうするのか」を明確にし、目的達成に最適なデザインを設計します。',
    color: '#3b82f6'
  },
  partner: {
    type: 'partner',
    name: 'パートナー型',
    description: 'クライアントとの信頼関係構築が得意なタイプ。相手の本当のニーズを引き出し、期待を超える提案ができます。',
    color: '#22c55e'
  },
  business_designer: {
    type: 'business_designer',
    name: 'ビジネスデザイナー型',
    description: 'デザイン×ビジネスで価値を生むタイプ。自分のスキルを収益に変える力があり、案件獲得や単価交渉にも強いです。',
    color: '#f59e0b'
  },
  growth: {
    type: 'growth',
    name: 'グロース型',
    description: '成長意欲と継続力で伸びていくタイプ。困難があっても諦めず、着実にスキルを積み上げていく力があります。',
    color: '#8b5cf6'
  },
  all_rounder: {
    type: 'all_rounder',
    name: 'オールラウンダー型',
    description: 'バランスよく全体を見渡せるタイプ。どの領域も安定しており、状況に応じて柔軟に対応できる強みがあります。',
    color: '#6b7280'
  }
};

export const skillLabels: Record<SkillCategory, string> = {
  design: '造形力',
  planning: '設計力',
  client: 'クライアントワーク力',
  business: 'ビジネス力',
  mindset: 'マインド力'
};
