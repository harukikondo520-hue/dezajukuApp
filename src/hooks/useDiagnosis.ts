import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { DiagnosisResult } from '../types/diagnosis';

export function useDiagnosis() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['diagnosis', user?.id],
    queryFn: async (): Promise<DiagnosisResult | null> => {
      const { data, error } = await supabase
        .from('skill_diagnosis')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSaveDiagnosis() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (diagnosis: Omit<DiagnosisResult, 'id' | 'user_id' | 'diagnosed_at' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('skill_diagnosis')
        .upsert({
          user_id: user!.id,
          ...diagnosis,
          diagnosed_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosis'] });
    },
  });
}

export function useSaveDiagnosisEx() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exData: {
      ex_answers: any[];
      ex_report: string;
      ex_summary: string;
      ex_key_points: string[];
    }) => {
      const { error } = await supabase
        .from('skill_diagnosis')
        .update({
          ...exData,
          ex_diagnosed_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosis'] });
    },
  });
}
