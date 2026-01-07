import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ClipboardList, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToDify } from '../lib/difyApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const STEPS = [
  { id: 1, title: '目的整理', description: '何のためのデザインか', placeholder: '例: 新規オープンするカフェの集客用Instagram投稿', color: 'bg-red-100 text-red-500' },
  { id: 2, title: 'ワンメッセージ', description: '一番伝えたいこと', placeholder: '例: 「毎日通いたくなる、こだわりの一杯」', color: 'bg-orange-100 text-orange-500' },
  { id: 3, title: '世界観', description: 'トーン＆ムード', placeholder: '例: ナチュラル、温かみ、落ち着いた雰囲気', color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, title: 'リサーチ', description: '参考事例・競合', placeholder: '例: Pinterest「カフェ Instagram」で検索', color: 'bg-green-100 text-green-500' },
  { id: 5, title: 'ラフ', description: 'レイアウト構成', placeholder: '例: 中央に商品写真、上部にキャッチコピー', color: 'bg-blue-100 text-blue-500' },
  { id: 6, title: 'デザイン', description: '制作内容', placeholder: '例: Canvaで制作、フォントはNoto Sans JP', color: 'bg-purple-100 text-purple-500' },
];

export default function SixStepReview() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stepInputs, setStepInputs] = useState<Record<number, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStepChange = (stepId: number, value: string) => {
    setStepInputs((prev) => ({ ...prev, [stepId]: value }));
  };

  const handleStartReview = async () => {
    // 全ステップの入力をまとめてメッセージにする
    const filledSteps = STEPS.filter((step) => stepInputs[step.id]?.trim());
    
    if (filledSteps.length === 0) {
      alert('少なくとも1つのステップを入力してください');
      return;
    }

    setIsStarted(true);
    setIsLoading(true);

    // ユーザーメッセージを構築
    let userContent = '【6STEP添削リクエスト】\n\n';
    STEPS.forEach((step) => {
      const value = stepInputs[step.id]?.trim();
      userContent += `■ ${step.id}. ${step.title}\n`;
      userContent += value ? value : '（未入力）';
      userContent += '\n\n';
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };
    setMessages([userMessage]);

    try {
      const streamingMessageId = (Date.now() + 1).toString();
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, streamingMessage]);

      let streamedContent = '';
      const response = await sendMessageToDify(
        userContent,
        '',
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: streamedContent, isStreaming: true }
                : msg
            )
          );
          scrollToBottom();
        },
        { name: profile?.name },
        'sixstep_review'
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? { ...msg, content: response.answer || streamedContent, isStreaming: false }
            : msg
        )
      );

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
    } catch (error) {
      console.error('エラー:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput('');

    try {
      const streamingMessageId = (Date.now() + 1).toString();
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, streamingMessage]);

      let streamedContent = '';
      const response = await sendMessageToDify(
        messageText,
        conversationId,
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: streamedContent, isStreaming: true }
                : msg
            )
          );
          scrollToBottom();
        },
        { name: profile?.name },
        'sixstep_review'
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? { ...msg, content: response.answer || streamedContent, isStreaming: false }
            : msg
        )
      );

      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }
    } catch (error) {
      console.error('エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">6STEP添削</h1>
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {!isStarted ? (
            /* 入力フォーム */
            <div className="space-y-4">
              {/* 説明カード */}
              <div className="bg-white rounded-3xl p-6 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-7 h-7 text-blue-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  6STEPで制作を進めよう
                </h2>
                <p className="text-sm text-slate-500">
                  各ステップを埋めていくと、AIがアドバイスします
                </p>
              </div>

              {/* ステップ入力カード */}
              <div className="bg-white rounded-3xl p-5 space-y-4">
                {STEPS.map((step) => (
                  <div key={step.id}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg ${step.color.split(' ')[0]} flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${step.color.split(' ')[1]}`}>{step.id}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
                        <p className="text-xs text-slate-500">{step.description}</p>
                      </div>
                    </div>
                    <textarea
                      value={stepInputs[step.id] || ''}
                      onChange={(e) => handleStepChange(step.id, e.target.value)}
                      placeholder={step.placeholder}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                ))}

                {/* 送信ボタン */}
                <button
                  onClick={handleStartReview}
                  disabled={isLoading}
                  className="w-full py-4 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      添削を受ける
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* チャット表示 */
            <div className="space-y-4">
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
                      <span className="text-slate-600 font-bold text-sm">You</span>
                    ) : (
                      <img
                        src="/haruki_icon.jpg"
                        alt="ハルキ"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-cyan-500 text-white rounded-tr-none'
                        : 'bg-white text-slate-900 rounded-tl-none'
                    }`}
                    style={{ maxWidth: '80%' }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && !messages.some((msg) => msg.isStreaming) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden">
                    <img src="/haruki_icon.jpg" alt="ハルキ" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3">
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
          )}
        </div>
      </div>

      {/* 入力エリア（チャット開始後） */}
      {isStarted && (
        <div className="flex-shrink-0 bg-white px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="質問や追加の相談..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
