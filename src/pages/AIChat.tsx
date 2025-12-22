import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `こんにちは、${profile?.name || 'ゲスト'}さん！ハルキAIです。デザジュクの創設者として、あなたの学習や案件について全力でサポートします。何でもお気軽にご質問ください。`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const difyChatUrl = import.meta.env.VITE_DIFY_CHAT_URL;
  const useDify = !!difyChatUrl;

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
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getPlaceholderResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
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

  if (useDify) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ハルキAI</h1>
          <p className="text-sm text-slate-500 mt-1">デザジュク創設者と直接話そう</p>
        </div>

        <div className="flex-1 rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={difyChatUrl}
            className="w-full h-full border-0"
            allow="microphone"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">ハルキAI</h1>
        <p className="text-sm text-slate-500 mt-1">デザジュク創設者と直接話そう</p>
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

      {messages.length === 1 && (
        <div className="px-4 mb-4">
          <p className="text-xs text-slate-500 mb-2">よくある質問:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-sm px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition"
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
            className="flex-1 bg-transparent px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          Dify連携準備中 - 設定が完了すると自動で有効化されます
        </p>
      </form>
    </div>
  );
}
