import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type UserBadge = Database['public']['Tables']['user_badges']['Row'];

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  projectCount: number;
  totalIncome: number;
  videosWatched: number;
  surveysCompleted: number;
}

const badgeDefinitions: BadgeDefinition[] = [
  {
    id: 'first_project',
    name: '最初の一歩',
    description: '初めての案件を登録',
    icon: '🎯',
    condition: (stats) => stats.projectCount >= 1,
  },
  {
    id: 'project_master',
    name: '案件マスター',
    description: '5つの案件を登録',
    icon: '💼',
    condition: (stats) => stats.projectCount >= 5,
  },
  {
    id: 'income_50k',
    name: '月収5万円達成',
    description: '月収5万円を達成',
    icon: '💰',
    condition: (stats) => stats.totalIncome >= 50000,
  },
  {
    id: 'income_100k',
    name: '月収10万円達成',
    description: '月収10万円を達成',
    icon: '💎',
    condition: (stats) => stats.totalIncome >= 100000,
  },
  {
    id: 'video_beginner',
    name: '学習スタート',
    description: '5本の動画を視聴',
    icon: '📚',
    condition: (stats) => stats.videosWatched >= 5,
  },
  {
    id: 'video_advanced',
    name: '学習の達人',
    description: '20本の動画を視聴',
    icon: '🎓',
    condition: (stats) => stats.videosWatched >= 20,
  },
  {
    id: 'goal_setter',
    name: '目標設定者',
    description: '月次アンケートを提出',
    icon: '🎯',
    condition: (stats) => stats.surveysCompleted >= 1,
  },
];

export function useBadges() {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    projectCount: 0,
    totalIncome: 0,
    videosWatched: 0,
    surveysCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBadgesAndStats();
    }
  }, [user]);

  const loadBadgesAndStats = async () => {
    try {
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user!.id);

      if (badgesError) throw badgesError;

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('reward')
        .eq('user_id', user!.id);

      if (projectsError) throw projectsError;

      const { data: progress, error: progressError } = await supabase
        .from('video_progress')
        .select('completed')
        .eq('user_id', user!.id)
        .eq('completed', true);

      if (progressError) throw progressError;

      const { data: surveys, error: surveysError } = await supabase
        .from('monthly_surveys')
        .select('id')
        .eq('user_id', user!.id);

      if (surveysError) throw surveysError;

      const stats: UserStats = {
        projectCount: projects.length,
        totalIncome: projects.reduce((sum, p) => sum + p.reward, 0),
        videosWatched: progress.length,
        surveysCompleted: surveys.length,
      };

      setUserBadges(badges || []);
      setUserStats(stats);

      await checkAndAwardBadges(stats, badges || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadges = async (stats: UserStats, currentBadges: UserBadge[]) => {
    const earnedBadgeIds = new Set(currentBadges.map((b) => b.badge_id));

    for (const badge of badgeDefinitions) {
      if (!earnedBadgeIds.has(badge.id) && badge.condition(stats)) {
        try {
          const { error } = await supabase.from('user_badges').insert({
            user_id: user!.id,
            badge_id: badge.id,
          });

          if (error && error.code !== '23505') {
            throw error;
          }
        } catch (error) {
          console.error('Error awarding badge:', error);
        }
      }
    }
  };

  const getEarnedBadges = () => {
    const earnedIds = new Set(userBadges.map((b) => b.badge_id));
    return badgeDefinitions.filter((b) => earnedIds.has(b.id));
  };

  const getUnearnedBadges = () => {
    const earnedIds = new Set(userBadges.map((b) => b.badge_id));
    return badgeDefinitions.filter((b) => !earnedIds.has(b.id));
  };

  return {
    earnedBadges: getEarnedBadges(),
    unearnedBadges: getUnearnedBadges(),
    userStats,
    loading,
    refresh: loadBadgesAndStats,
  };
}
