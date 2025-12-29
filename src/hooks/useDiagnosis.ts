import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { DiagnosisResult } from '../types/diagnosis';

interface SkillDiagnosis {
  design_skill?: number;
  planning_skill?: number;
  client_skill?: number;
  business_skill?: number;
  mindset_skill?: number;
}

/**
 * デザイナータイプ診断結果を取得
 */
export function useDiagnosisResult(userId: string | undefined) {
  return useQuery({
    queryKey: ['diagnosis-result', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('diagnosis')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as DiagnosisResult | null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30分間新鮮（診断結果はあまり変更されない）
  });
}

/**
 * スキル診断結果を取得
 */
export function useSkillDiagnosis(userId: string | undefined) {
  return useQuery({
    queryKey: ['skill-diagnosis', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('skill_diagnosis')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as SkillDiagnosis | null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30分間新鮮
  });
}
