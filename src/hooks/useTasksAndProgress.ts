import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];
type UserTask = Database['public']['Tables']['user_tasks']['Row'];

/**
 * タスク一覧を取得
 */
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index');

      if (error) throw error;
      return (data || []) as Task[];
    },
    staleTime: 1000 * 60 * 30, // 30分間新鮮（タスクはあまり変更されない）
  });
}

/**
 * ユーザーのタスク進捗を取得
 */
export function useUserTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-tasks', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []) as UserTask[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間新鮮
  });
}

/**
 * 動画視聴進捗を取得
 */
export function useVideoProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['video-progress', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { count: completed, error: completedError } = await supabase
        .from('user_video_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

      const { count: total, error: totalError } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      if (completedError || totalError) {
        throw completedError || totalError;
      }

      return { completed: completed || 0, total: total || 0 };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間新鮮
  });
}

