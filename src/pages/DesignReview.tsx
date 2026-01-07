import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToDify } from '../lib/difyApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function DesignReview() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalText, setAdditionalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartFromIntro = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelectedFromIntro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsStarted(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage && !additionalText.trim()) return;
    if (isLoading) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: additionalText || 'デザインを添削してください',
      imageUrl: imagePreview || undefined,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const messageText = additionalText || 'このデザインを添削してください。';
    setAdditionalText('');
    handleRemoveImage();

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
        'design_review'
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
      scrollToBottom();
    }
  };

  // 詳細画面（イントロ）
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* ヘッダー */}
        <div className="flex-shrink-0 px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        </div>

        {/* メイン画像 */}
        <div className="px-4">
          <div className="aspect-square max-w-xs mx-auto">
            <img
              src="/haruki_icon.jpg"
              alt="デザイン添削AI"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* 赤いエリア */}
        <div className="flex-1 bg-red-500 mt-6 rounded-t-[2rem] px-6 py-8">
          <h1 className="text-2xl font-black text-white mb-4">
            デザイン添削AI
          </h1>
          <p className="text-white/90 text-sm leading-relaxed mb-8">
            プロのアートディレクター目線で、あなたのデザインを5つの観点から100点満点で評価します。
            目的達成力・レイアウト・メリハリ・配色・伝達力の観点から具体的な改善点をお伝えします。
          </p>

          {/* アップロードボタン */}
          <button
            onClick={handleStartFromIntro}
            className="w-full border-2 border-dashed border-white/50 rounded-2xl py-6 flex flex-col items-center gap-2 hover:bg-white/10 transition"
          >
            <Upload size={24} className="text-white" />
            <span className="text-white font-medium">アップロード</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelectedFromIntro}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // チャット画面
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-red-500 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setIsStarted(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">デザイン添削</h1>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
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
                    ? 'bg-red-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-900 rounded-tl-none'
                }`}
                style={{ maxWidth: '80%' }}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="アップロード画像"
                    className="rounded-lg mb-2 max-w-full"
                  />
                )}
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
      </div>

      {/* 入力エリア */}
      <div className="flex-shrink-0 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="プレビュー" className="h-20 rounded-xl" />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              <Upload size={20} className="text-slate-600" />
            </button>
            <input
              type="text"
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              placeholder="補足コメント（任意）"
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={(!selectedImage && !additionalText.trim()) || isLoading}
              className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
