import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';

// モードの定義（壁打ち、6STEP添削、営業文添削）
const MODES = [
  { id: 'casual', label: '壁打ち' },
  { id: 'sixstep', label: '6STEP添削' },
  { id: 'sales', label: '営業文添削' },
] as const;

type Mode = 'casual' | 'sixstep' | 'sales';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // URLからモードを取得（デフォルトは casual）
  const currentMode = (searchParams.get('mode') as Mode) || 'casual';

  // メッセージ状態
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(currentMode),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // メッセージが増えたら一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // モードを変更する関数
  const handleModeChange = (newMode: Mode) => {
    setSearchParams({ mode: newMode });
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(newMode),
      },
    ]);
  };

  // メッセージ送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode: currentMode,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const aiMessageId = (Date.now() + 1).toString();
      let aiContent = '';

      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        aiContent += text;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, content: aiContent } : m
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      // エラー時はダミーレスポンス
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getFallbackResponse(currentMode),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900 text-center">ハルキAI</h1>
      </header>

      {/* モード切替タブ */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 sticky top-12 z-10">
        <div className="flex gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`
                flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all
                ${currentMode === mode.id
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AIのアイコン */}
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 flex-shrink-0">
                🤖
              </div>
            )}

            {/* メッセージ本体 */}
            <div
              className={`
                max-w-[75%] rounded-2xl px-4 py-3
                ${message.role === 'user'
                  ? 'bg-red-500 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm'
                }
              `}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
              🤖
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力欄（固定表示） */}
      <form 
        onSubmit={handleSubmit} 
        className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20"
      >
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="
              flex-1 border border-slate-200 rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
              disabled:bg-slate-100 disabled:cursor-not-allowed
            "
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="
              bg-red-500 text-white p-3 rounded-xl
              hover:bg-red-600 transition-colors
              disabled:bg-slate-300 disabled:cursor-not-allowed
            "
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

// モード別のウェルカムメッセージ
function getWelcomeMessage(mode: Mode): string {
  switch (mode) {
    case 'casual':
      return `こんにちは！ハルキAIです 🙌

今日は何について話しましょうか？
デザインのこと、仕事のこと、モヤモヤしてること...
なんでも気軽に話してくださいね！`;

    case 'sixstep':
      return `6STEP添削モードですね！📝

デザイン制作の6ステップについて添削します。

1. 目的整理
2. ワンメッセージ設計
3. 世界観設計
4. リサーチ
5. ラフ構成
6. デザイン生成

どのステップで困っていますか？`;

    case 'sales':
      return `営業文添削モードですね！✉️

クラウドソーシングの提案文、SNSのDM、メールなど...
どんな営業文でも添削します！

添削してほしい文章を送ってください。
ぶち上げていきましょう！`;
  }
}

// フォールバックレスポンス
function getFallbackResponse(mode: Mode): string {
  switch (mode) {
    case 'casual':
      return `なるほど！いい質問ですね 💡

もう少し詳しく教えてもらえますか？
一緒に考えていきましょう！`;

    case 'sixstep':
      return `なるほど！その点について添削しますね 📝

大事なのは「目的」に立ち返ることです。
・なぜこのデザインが必要なのか
・誰に届けたいのか
・どんな行動を促したいのか

この3点を明確にして、もう一度見直してみてください！`;

    case 'sales':
      return `営業文、見させてもらいました！✉️

改善ポイントは3つです：
1. 冒頭でベネフィットを明確に
2. 具体的な実績や数字を入れる
3. 相手が返信したくなるCTAを入れる

この3点を意識して書き直してみてください！
ぶち上げていきましょう！`;
  }
}

export default ChatPage;
