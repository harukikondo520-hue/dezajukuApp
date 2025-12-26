import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', 'all', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: { name: string; reward: number; status: string; completed_at?: string | null }) => {
      const { error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyIncome'] });
      queryClient.invalidateQueries({ queryKey: ['thisMonthIncome'] });
      queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
      queryClient.invalidateQueries({ queryKey: ['communityStats'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyIncome'] });
      queryClient.invalidateQueries({ queryKey: ['thisMonthIncome'] });
      queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
      queryClient.invalidateQueries({ queryKey: ['communityStats'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyIncome'] });
      queryClient.invalidateQueries({ queryKey: ['thisMonthIncome'] });
      queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
      queryClient.invalidateQueries({ queryKey: ['communityStats'] });
    },
  });
}
