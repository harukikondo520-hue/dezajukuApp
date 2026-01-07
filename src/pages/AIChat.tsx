import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToDify } from '../lib/difyApi';
import { supabase } from '../lib/supabase';
import { designerTypes } from '../data/questions';
import { useConversations, useConversationMessages, useDiagnosisData, useCreateConversation, useDeleteConversation, useUpdateConversationTitle } from '../hooks/useConversations';
import { ConversationListSkeleton } from '../components/Skeleton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  dify_conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function AIChat() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // React Query フック
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations(user?.id);
  const { data: diagnosisData = null } = useDiagnosisData(user?.id);
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const updateConversationTitle = useUpdateConversationTitle();

  // トークルーム関連
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 選択中の会話のメッセージを取得
  const { data: conversationMessages = [] } = useConversationMessages(currentConversation?.id || null);

  const difyApiKey = import.meta.env.VITE_DIFY_API_KEY;
  const difyApiUrl = import.meta.env.VITE_DIFY_API_URL;
  const useDify = !!(difyApiKey && difyApiUrl);

  // 会話が変更されたらメッセージをロード
  useEffect(() => {
    if (conversationMessages.length > 0) {
      setMessages(
        conversationMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))
      );
    } else if (currentConversation) {
      setMessages([]);
    }
  }, [conversationMessages, currentConversation]);

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setIsSidebarOpen(false);
  };

  const createNewConversation = async (): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const newConv = await createConversation.mutateAsync({
        userId: user.id,
        title: '新しい会話',
      });
      
      setCurrentConversation(newConv);
      setMessages([]);
      setIsSidebarOpen(false);
      return newConv;
    } catch (error) {
      console.error('トークルーム作成エラー:', error);
      return null;
    }
  };

  const generateConversationTitle = async (userMessage: string, aiResponse: string) => {
    if (!currentConversation || !user) return;

    try {
      const titlePrompt = `以下の会話の内容を、15文字以内の簡潔なタイトルにしてください。タイトルのみを返してください。

ユーザー: ${userMessage.slice(0, 100)}
AI: ${aiResponse.slice(0, 100)}`;

      const response = await sendMessageToDify(
        titlePrompt,
        '',
        () => {},
        { name: profile?.name }
      );

      const generatedTitle = response.answer.trim().slice(0, 30);

      await updateConversationTitle.mutateAsync({
        conversationId: currentConversation.id,
        title: generatedTitle,
        userId: user.id,
      });
      
      setCurrentConversation((prev) => (prev ? { ...prev, title: generatedTitle } : null));
    } catch (error) {
      console.error('タイトル生成エラー:', error);
      const fallbackTitle = userMessage.slice(0, 20) + (userMessage.length > 20 ? '...' : '');
      
      await updateConversationTitle.mutateAsync({
        conversationId: currentConversation.id,
        title: fallbackTitle,
        userId: user.id,
      });
      
      setCurrentConversation((prev) => (prev ? { ...prev, title: fallbackTitle } : null));
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('このトークルームを削除しますか？')) return;
    if (!user) return;

    if (currentConversation?.id === conversationId) {
      if (conversations.length > 1) {
        const nextConversation = conversations.find((c) => c.id !== conversationId);
        if (nextConversation) {
          loadConversation(nextConversation);
        }
      } else {
        setCurrentConversation(null);
        setMessages([]);
      }
    }

    try {
      await deleteConversation.mutateAsync({ conversationId, userId: user.id });
    } catch (error) {
      console.error('トークルーム削除エラー:', error);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, conversationId: string) => {
    if (!conversationId) return;

    const { error } = await supabase
      .from('conversation_messages')
      .insert([{ conversation_id: conversationId, role, content }]);

    if (error) {
      console.error('メッセージ保存エラー:', error);
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    setIsLoading(true);
    setError('');

    let conversation = currentConversation;

    if (!conversation) {
      try {
        conversation = await createNewConversation();
        if (!conversation) {
          setError('トークルームの作成に失敗しました。');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        setError('トークルームの作成に失敗しました。');
        setIsLoading(false);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const conversationId = conversation.id;

    try {
      await saveMessage('user', messageText, conversationId);
    } catch (err) {
      console.error('メッセージ保存エラー:', err);
    }

    let streamingMessageId = '';

    if (useDify) {
      try {
        streamingMessageId = (Date.now() + 1).toString();
        const streamingMessage: Message = {
          id: streamingMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        };
        setMessages((prev) => [...prev, streamingMessage]);

        const userContext: any = {
          name: profile?.name,
          goal: profile?.goal,
          currentProblem: profile?.current_problem,
        };

        if (diagnosisData) {
          if (diagnosisData.designer_type) {
            const typeInfo = designerTypes[diagnosisData.designer_type as keyof typeof designerTypes];
            if (typeInfo) {
              userContext.designerType = typeInfo.name;
              userContext.designerTypeDescription = typeInfo.description;
            }
          }
        }

        let streamedContent = '';
        const response = await sendMessageToDify(
          messageText,
          conversation.dify_conversation_id || '',
          (chunk) => {
            streamedContent += chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? { ...msg, content: streamedContent, isStreaming: true }
                  : msg
              )
            );
          },
          userContext,
          'free_talk'
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId
              ? { ...msg, content: response.answer || streamedContent, isStreaming: false }
              : msg
          )
        );

        const assistantContent = response.answer || streamedContent;
        if (assistantContent) {
          await saveMessage('assistant', assistantContent, conversationId);
        }

        if (conversation.title === '新しい会話' && assistantContent) {
          await generateConversationTitle(messageText, assistantContent);
        }

        if (response.conversation_id && !conversation.dify_conversation_id) {
          await supabase
            .from('conversations')
            .update({ dify_conversation_id: response.conversation_id })
            .eq('id', conversation.id);

          setCurrentConversation((prev) =>
            prev ? { ...prev, dify_conversation_id: response.conversation_id } : null
          );
        }
      } catch (err: any) {
        console.error('Dify API エラー:', err);
        setError(err.message || 'AIからの応答に失敗しました。');
        
        if (streamingMessageId) {
          setMessages((prev) => prev.filter(msg => msg.id !== streamingMessageId));
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '申し訳ございません。現在AIからの応答が取得できません。しばらく経ってから再度お試しください。',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(async () => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Dify APIが設定されていません。.envファイルにVITE_DIFY_API_KEYとVITE_DIFY_API_URLを設定してください。',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
          await saveMessage('assistant', assistantMessage.content, conversationId);
        } catch (err) {
          console.error('メッセージ保存エラー:', err);
        }

        setIsLoading(false);
      }, 1000);
    }
  };

  const suggestedQuestions = [
    'LP制作の案件獲得方法を教えて',
    'デザイン単価を上げるコツは？',
    'ポートフォリオの作り方',
    '営業文の書き方',
  ];

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 80px)', maxHeight: 'calc(100vh - 80px)' }}>
      {/* サイドバー */}
      <div
        className={`fixed inset-0 z-40 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`fixed lg:static inset-y-0 left-0 w-80 bg-slate-900 text-white z-50 transform transition-transform lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">トークルーム</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <button
              onClick={createNewConversation}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              新しい会話
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversationsLoading ? (
              <ConversationListSkeleton />
            ) : conversations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                トークルームがありません
                <br />
                新しい会話を作成しましょう
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition ${
                    currentConversation?.id === conv.id
                      ? 'bg-red-600'
                      : 'hover:bg-slate-800'
                  }`}
                  onClick={() => loadConversation(conv)}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(conv.updated_at).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-700 rounded transition"
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden h-full">
        {/* ヘッダー */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg transition"
            >
              <Menu size={24} className="text-slate-700" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src="/haruki_icon.jpg"
                alt="ハルキ"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="font-bold text-slate-900">ハルキAI</h1>
                <p className="text-xs text-slate-500">デザジュク創設者と話そう</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center flex-shrink-0">
            {error}
          </div>
        )}

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <img
                src="/haruki_icon.jpg"
                alt="ハルキさん"
                className="w-16 h-16 rounded-2xl shadow-lg object-cover mb-4"
              />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                ハルキAIと話そう
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                デザジュク創設者のハルキが、あなたのデザイナーキャリアをサポートします。
                何でもお気軽にご質問ください。
              </p>
              <div className="space-y-2 w-full max-w-md">
                <p className="text-xs text-slate-500 mb-2">よくある質問:</p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="w-full text-left text-sm px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition border border-slate-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${
                      message.role === 'user' ? 'bg-slate-200' : ''
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={20} className="text-slate-600" />
                    ) : (
                      <img
                        src="/haruki_icon.jpg"
                        alt="ハルキさん"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-900 rounded-tl-none'
                    }`}
                    style={{ maxWidth: '75%' }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && !messages.some(msg => msg.isStreaming) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden">
                    <img
                      src="/haruki_icon.jpg"
                      alt="ハルキさん"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 入力エリア */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-3 sticky bottom-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "送信中..." : "ハルキAIに質問する..."}
                className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 sm:p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
