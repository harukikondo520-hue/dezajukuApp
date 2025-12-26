import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface MonthlyData {
  month: string;
  amount: number;
}

/**
 * 月別収入データを取得
 */
export function useMonthlyIncome(userId: string | undefined) {
  return useQuery({
    queryKey: ['monthly-income', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('projects')
        .select('reward, completed_at, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const monthlyMap = new Map<string, number>();
      const now = new Date();

      // 過去6ヶ月分のデータを初期化
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(key, 0);
      }

      // プロジェクトデータを集計
      data?.forEach((project) => {
        const dateStr = project.completed_at || project.created_at;
        if (!dateStr) return;

        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlyMap.get(key) || 0;
        monthlyMap.set(key, current + (project.reward || 0));
      });

      // Map を配列に変換してソート
      return Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month)) as MonthlyData[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3分間新鮮
  });
}

/**
 * 今月の収入を計算
 */
export function useThisMonthIncome(userId: string | undefined) {
  return useQuery({
    queryKey: ['this-month-income', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('projects')
        .select('reward')
        .eq('user_id', userId)
        .gte('completed_at', startOfMonth)
        .lte('completed_at', endOfMonth);

      if (error) throw error;

      return data?.reduce((sum, p) => sum + (p.reward || 0), 0) || 0;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1分間新鮮
  });
}

/**
 * 累計収入を計算
 */
export function useTotalIncome(userId: string | undefined) {
  return useQuery({
    queryKey: ['total-income', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('projects')
        .select('reward')
        .eq('user_id', userId);

      if (error) throw error;

      return data?.reduce((sum, p) => sum + (p.reward || 0), 0) || 0;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間新鮮
  });
}

