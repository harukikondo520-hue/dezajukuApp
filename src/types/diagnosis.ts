export interface DiagnosisQuestion {
  id: number;
  category: SkillCategory;
  text: string;
}

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

export type DesignerType =
  | 'artist'
  | 'strategist'
  | 'partner'
  | 'business_designer'
  | 'growth'
  | 'all_rounder';

export interface DiagnosisResult {
  id: string;
  user_id: string;
  design_skill: number;
  planning_skill: number;
  client_skill: number;
  business_skill: number;
  mindset_skill: number;
  designer_type: DesignerType;
  raw_answers: Record<string, number>;
  diagnosed_at: string;
}

export interface DesignerTypeInfo {
  type: DesignerType;
  name: string;
  description: string;
  color: string;
}
