import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];

/**
 * 今月のアクティブな案件を取得
 */
export function useCurrentMonthProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'current-month', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'completed')
        .gte('completed_at', startOfMonth)
        .lte('completed_at', endOfMonth)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Project[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2分間新鮮
  });
}

/**
 * 全ての案件を取得
 */
export function useAllProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'all', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Project[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間新鮮
  });
}

/**
 * 過去の案件を取得（今月以外の完了済み案件）
 */
export function usePastProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'past', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .lt('completed_at', startOfMonth)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Project[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間新鮮
  });
}

