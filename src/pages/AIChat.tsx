import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToDify } from '../lib/difyApi';
import { supabase } from '../lib/supabase';
import { designerTypes } from '../data/questions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface DiagnosisData {
  designer_type?: string;
  design_skill?: number;
  planning_skill?: number;
  client_skill?: number;
  business_skill?: number;
  mindset_skill?: number;
}

export default function AIChat() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const difyApiKey = import.meta.env.VITE_DIFY_API_KEY;
  const difyApiUrl = import.meta.env.VITE_DIFY_API_URL;
  const useDify = !!(difyApiKey && difyApiUrl);

  // 会話IDをローカルストレージから読み込み
  useEffect(() => {
    const savedConversationId = localStorage.getItem('dify_conversation_id');
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  // 診断結果を読み込み
  useEffect(() => {
    const loadDiagnosisData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('skill_diagnosis')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          setDiagnosisData(data);
          console.log('診断データを読み込みました:', data);
        }
      } catch (error) {
        console.error('診断データの読み込みに失敗:', error);
      }
    };

    loadDiagnosisData();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    setError('');

    // Dify APIが設定されている場合
    if (useDify) {
      try {
        // ストリーミング用のメッセージを追加
        const streamingMessageId = (Date.now() + 1).toString();
        const streamingMessage: Message = {
          id: streamingMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        };
        setMessages((prev) => [...prev, streamingMessage]);

        // ユーザーコンテキストを構築
        const userContext: any = {
          name: profile?.name,
        };

        if (diagnosisData) {
          // デザイナータイプ情報
          if (diagnosisData.designer_type) {
            const typeInfo = designerTypes[diagnosisData.designer_type as keyof typeof designerTypes];
            if (typeInfo) {
              userContext.designerType = typeInfo.name;
              userContext.designerTypeDescription = typeInfo.description;
            }
          }

          // スキル診断情報
          if (diagnosisData.design_skill !== null && diagnosisData.design_skill !== undefined) {
            userContext.designSkill = diagnosisData.design_skill;
            userContext.planningSkill = diagnosisData.planning_skill;
            userContext.clientSkill = diagnosisData.client_skill;
            userContext.businessSkill = diagnosisData.business_skill;
            userContext.mindsetSkill = diagnosisData.mindset_skill;
          }
        }

        console.log('Difyに送信するコンテキスト:', userContext);

        // Dify APIにメッセージを送信（ストリーミング）
        const response = await sendMessageToDify(
          userInput,
          conversationId,
          (chunk) => {
            // ストリーミングでテキストを更新
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          userContext
        );

        // ストリーミング完了後、isStreamingをfalseに
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );

        // 会話IDを保存
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
          localStorage.setItem('dify_conversation_id', response.conversation_id);
        }
      } catch (err: any) {
        console.error('Dify API エラー:', err);
        setError(err.message || 'メッセージの送信に失敗しました');
        
        // エラーメッセージを表示
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'すみません、エラーが発生しました。もう一度お試しください。',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Dify未設定の場合はプレースホルダー
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getPlaceholderResponse(userInput),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleResetConversation = () => {
    localStorage.removeItem('dify_conversation_id');
    setConversationId('');
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `こんにちは、${profile?.name || 'ゲスト'}さん！ハルキAIです。デザジュクの創設者として、あなたの学習や案件について全力でサポートします。何でもお気軽にご質問ください。`,
        timestamp: new Date(),
      },
    ]);
  };

  const getPlaceholderResponse = (question: string): string => {
    const responses = [
      'ご質問ありがとうございます。Dify連携が完了すると、より詳細な回答をお届けできるようになります。',
      '素晴らしい質問ですね！ハルキAIとして、あなたのデザイナーキャリアを全力でサポートします。',
      'デザジュクの創設者として、あなたの成長を心から応援しています。この機能は近日中にフル稼働します。',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const suggestedQuestions = [
    'LP制作の案件獲得方法を教えて',
    'デザイン単価を上げるコツは？',
    'ポートフォリオの作り方',
    '営業文の書き方',
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      {/* ヘッダー - スマホで小さく */}
      <div className="text-center py-3 sm:py-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex-1" />
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
            <Sparkles size={20} className="sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 flex justify-end">
            {useDify && (
              <button
                onClick={handleResetConversation}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="会話をリセット"
              >
                <RefreshCw size={16} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900">ハルキAI</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {useDify ? 'デザジュク創設者と直接話そう' : 'Dify連携準備中'}
        </p>
        {error && (
          <div className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 text-xs sm:text-sm rounded-lg inline-block">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-slate-200'
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}
            >
              {message.role === 'user' ? (
                <User size={20} className="text-slate-600" />
              ) : (
                <Bot size={20} className="text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-900 rounded-tl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
              <Bot size={20} className="text-white" />
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
      </div>

      {messages.length === 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs text-slate-500 mb-2">よくある質問:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-xs sm:text-sm px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ハルキAIに質問する..."
            className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 sm:p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          {useDify ? (
            <>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
              Dify連携中
            </>
          ) : (
            'Dify連携準備中 - .envファイルでVITE_DIFY_API_KEYとVITE_DIFY_API_URLを設定してください'
          )}
        </p>
      </form>
    </div>
  );
}
