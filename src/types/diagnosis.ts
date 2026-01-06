// === 新タイプ診断（3軸×2択=8タイプ） ===

// 軸の定義
export type ThinkingAxis = 'Logic' | 'Emotion';
export type WeaponAxis = 'Craft' | 'Business';
export type EngineAxis = 'Self' | 'Others';

// タイプコード（LCS, ECS, LBS, EBS, LCO, ECO, LBO, EBO）
export type DesignerTypeCode = 'LCS' | 'ECS' | 'LBS' | 'EBS' | 'LCO' | 'ECO' | 'LBO' | 'EBO';

// グループ
export type TypeGroup = 'A' | 'B';

// 質問の軸タイプ
export type QuestionAxis = 'thinking' | 'weapon' | 'engine';

// 質問の型
export interface DiagnosisQuestion {
  id: number;
  axis: QuestionAxis;
  text: string;
  labelA: string;  // Logic/Craft/Self側
  labelB: string;  // Emotion/Business/Others側
}

// 軸スコア
export interface AxisScores {
  logic: number;
  emotion: number;
  craft: number;
  business: number;
  self: number;
  others: number;
}

// 軸判定結果
export interface AxisResult {
  thinking: ThinkingAxis;
  weapon: WeaponAxis;
  engine: EngineAxis;
}

// タイプ詳細情報
export interface DesignerTypeInfo {
  code: DesignerTypeCode;
  name: string;
  combination: string;  // "Logic × Craft × Self" など
  group: TypeGroup;
  color: string;
  tagline: string;
  features: string[];
  action: string;        // 0→1アクション
  weapons: string[];     // 武器
  winningStrategy: string; // 勝ち筋
}

// 診断結果
export interface DiagnosisResult {
  id: string;
  user_id: string;
  type_code: DesignerTypeCode;
  type_name: string;
  type_group: TypeGroup;
  score_logic: number;
  score_emotion: number;
  score_craft: number;
  score_business: number;
  score_self: number;
  score_others: number;
  axis_thinking: ThinkingAxis;
  axis_weapon: WeaponAxis;
  axis_engine: EngineAxis;
  raw_answers: number[];
  diagnosed_at: string;
  values?: ValueAnswer[];
}

// 価値観回答
export interface ValueAnswer {
  questionId: number;
  question: string;
  answer: string;
}

// === 旧システムとの互換性のため（徐々に削除予定） ===
export type DesignerType = 
  | 'artist' 
  | 'strategist' 
  | 'partner' 
  | 'business_designer' 
  | 'growth' 
  | 'all_rounder';

export type SkillCategory =
  | 'design'
  | 'planning'
  | 'client'
  | 'business'
  | 'mindset';

export interface SkillScores {
  design: number;
  planning: number;
  client: number;
  business: number;
  mindset: number;
}
