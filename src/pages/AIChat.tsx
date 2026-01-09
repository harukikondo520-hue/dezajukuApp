import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChat } from 'ai/react';
import { ChevronLeft, Send } from 'lucide-react';

// モードの定義
const MODES = [
  { id: 'casual', label: '壁打ち', emoji: '💭' },
  { id: 'project', label: '案件サポート', emoji: '💼' },
  { id: 'analysis', label: '自己分析', emoji: '🔍' },
] as const;

type Mode = 'casual' | 'project' | 'analysis';

export function ChatPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // URLからモードを取得（デフォルトは casual）
  const currentMode = (searchParams.get('mode') as Mode) || 'casual';

  // ユーザーのタイプ（後でストアから取得するように変更）
  const userType = '翻訳するデザイナー';

  // ★★★ ここがVercel AI SDKの核心 ★★★
  const {
    messages,           // メッセージの配列
    input,              // 入力欄の値
    handleInputChange,  // 入力欄が変わったときの処理
    handleSubmit,       // 送信したときの処理
    isLoading,          // AIが返答中かどうか
    setMessages,        // メッセージを直接セットする
  } = useChat({
    api: '/api/chat',   // バックエンドのURL
    body: {             // 追加で送るデータ
      mode: currentMode,
      userType: userType,
    },
    initialMessages: [  // 最初のメッセージ
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(currentMode),
      },
    ],
  });

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

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* ===== ヘッダー ===== */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">ハルキAI</h1>
          <p className="text-xs text-gray-500">{userType}</p>
        </div>
      </header>

      {/* ===== モード切替タブ ===== */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`
                flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${currentMode === mode.id
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {mode.emoji} {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== メッセージ一覧 ===== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  ? 'bg-red-500 text-white rounded-tr-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-tl-md'
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
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        {/* スクロール用の空要素 */}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== 入力欄 ===== */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-t p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="
              flex-1 border border-gray-200 rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="
              bg-red-500 text-white p-3 rounded-xl
              hover:bg-red-600 transition-colors
              disabled:bg-gray-300 disabled:cursor-not-allowed
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

    case 'project':
      return `案件サポートモードですね！💼

今進めている案件で困っていることはありますか？

- 見積もりの出し方
- クライアントへの伝え方
- 修正対応の判断

なんでも相談してください！`;

    case 'analysis':
      return `自己分析モードですね！🔍

自分の強みや方向性について、一緒に考えましょう。

- 自分の強みをもっと知りたい
- どんな案件が向いているか
- キャリアの方向性

何でも聞いてください！`;
  }
}

export default ChatPage;