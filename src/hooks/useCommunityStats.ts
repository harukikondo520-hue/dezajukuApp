import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CommunityStats } from '../types/community';

export function useCommunityStats() {
  return useQuery({
    queryKey: ['communityStats'],
    queryFn: async (): Promise<CommunityStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: monthlyProjects, error: monthlyError } = await supabase
        .from('projects')
        .select('reward, user_id')
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyError) throw monthlyError;

      const { data: offsetData } = await supabase
        .from('community_settings')
        .select('value')
        .eq('key', 'cumulative_offset')
        .maybeSingle();

      const cumulativeOffset = (offsetData?.value as any)?.amount || 20000000;

      const { data: allProjects } = await supabase
        .from('projects')
        .select('reward');

      const dbCumulative = allProjects?.reduce((sum, p) => sum + (p.reward || 0), 0) || 0;

      const { data: monthlyHistory } = await supabase
        .from('projects')
        .select('reward, created_at')
        .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString());

      const totalMonthly = monthlyProjects?.reduce((sum, p) => sum + (p.reward || 0), 0) || 0;
      const uniqueUsers = new Set(monthlyProjects?.map(p => p.user_id));
      const avgMonthly = uniqueUsers.size > 0 ? Math.round(totalMonthly / uniqueUsers.size) : 0;
      const maxMonthly = Math.max(...(monthlyProjects?.map(p => p.reward) || [0]));

      const historyMap = new Map<string, number>();
      monthlyHistory?.forEach(p => {
        const month = new Date(p.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
        historyMap.set(month, (historyMap.get(month) || 0) + (p.reward || 0));
      });

      return {
        totalMonthlyRevenue: totalMonthly,
        averageMonthlyIncome: avgMonthly,
        mvpIncome: maxMonthly,
        mvpUserName: '匿名',
        cumulativeRevenue: cumulativeOffset + dbCumulative,
        activeUsersCount: uniqueUsers.size,
        monthlyRevenueHistory: Array.from(historyMap.entries()).map(([month, total]) => ({
          month,
          total
        }))
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}
