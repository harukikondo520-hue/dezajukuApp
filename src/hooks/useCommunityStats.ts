import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CommunityStats } from '../types/community';

export function useCommunityStats() {
  return useQuery({
    queryKey: ['communityStats'],
    queryFn: async (): Promise<CommunityStats> => {
      try {
        // PostgreSQL関数を使用して累計収益を取得
        const { data: cumulativeData, error: cumulativeError } = await supabase
          .rpc('get_cumulative_revenue');

        if (cumulativeError) {
          console.error('Error fetching cumulative revenue:', cumulativeError);
        }

        const cumulativeRevenue = cumulativeData || 0;
        console.log('Cumulative revenue from RPC:', cumulativeRevenue);

        // PostgreSQL関数を使用して今月の統計を取得
        const { data: monthlyData, error: monthlyError } = await supabase
          .rpc('get_monthly_stats');

        if (monthlyError) {
          console.error('Error fetching monthly stats:', monthlyError);
        }

        const monthlyStats = monthlyData?.[0] || {
          total_monthly_revenue: 0,
          active_users_count: 0,
          avg_monthly_income: 0,
          mvp_income: 0,
        };

        // PostgreSQL関数を使用して履歴を取得
        const { data: historyData, error: historyError } = await supabase
          .rpc('get_monthly_history');

        if (historyError) {
          console.error('Error fetching monthly history:', historyError);
        }

        const monthlyRevenueHistory = (historyData as any)?.map((row: any) => ({
          month: row.month,
          total: row.total,
        })) || [];

        return {
          totalMonthlyRevenue: Number(monthlyStats.total_monthly_revenue),
          averageMonthlyIncome: Number(monthlyStats.avg_monthly_income),
          mvpIncome: Number(monthlyStats.mvp_income),
          mvpUserName: '匿名',
          cumulativeRevenue: Number(cumulativeRevenue),
          activeUsersCount: Number(monthlyStats.active_users_count),
          monthlyRevenueHistory,
        };
      } catch (error) {
        console.error('Error in useCommunityStats:', error);
        throw error;
      }
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}
