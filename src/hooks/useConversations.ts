import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface Conversation {
  id: string;
  title: string;
  dify_conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * ユーザーの会話一覧を取得
 */
export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Conversation[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2分間新鮮
  });
}

/**
 * 特定の会話のメッセージを取得
 */
export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5分間新鮮
  });
}

/**
 * 診断データを取得
 */
export function useDiagnosisData(userId: string | undefined) {
  return useQuery({
    queryKey: ['diagnosis-data', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const [diagnosisResult, skillDiagnosis] = await Promise.all([
        supabase
          .from('skill_diagnosis')
          .select('designer_type, values')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('skill_diagnosis')
          .select('design_skill, planning_skill, client_skill, business_skill, mindset_skill')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      return {
        designer_type: diagnosisResult.data?.designer_type,
        design_skill: skillDiagnosis.data?.design_skill,
        planning_skill: skillDiagnosis.data?.planning_skill,
        client_skill: skillDiagnosis.data?.client_skill,
        business_skill: skillDiagnosis.data?.business_skill,
        mindset_skill: skillDiagnosis.data?.mindset_skill,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30分間新鮮（診断結果はあまり変更されない）
  });
}

/**
 * 新しい会話を作成
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, title }: { userId: string; title?: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: title || '新しい会話',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.userId] });
    },
  });
}

/**
 * 会話を削除
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
}

/**
 * 会話のタイトルを更新
 */
export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, title, userId }: { conversationId: string; title: string; userId: string }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.userId] });
    },
  });
}

