import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, Image, X, Loader2 } from 'lucide-react';
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
    const imageToSend = selectedImage; // 送信前に画像を保持
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
        'design_review',
        undefined,
        imageToSend || undefined // 画像ファイルを渡す
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
          <h1 className="text-lg font-bold text-slate-900">デザイン添削</h1>
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Image className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  デザインを添削します
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  添削してほしいデザイン画像をアップロードしてください
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 transition"
                >
                  <Upload size={20} />
                  画像をアップロード
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="bg-white rounded-3xl p-5">
                <h3 className="font-bold text-slate-800 mb-4 text-sm">評価観点（各100点満点）</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { color: 'bg-red-100 text-red-500', label: '目的達成力（売上貢献）' },
                    { color: 'bg-blue-100 text-blue-500', label: 'レイアウト（視線誘導・余白）' },
                    { color: 'bg-green-100 text-green-500', label: 'メリハリ（主役の明確化）' },
                    { color: 'bg-yellow-100 text-yellow-600', label: '配色（読みやすさ）' },
                    { color: 'bg-purple-100 text-purple-500', label: '伝達力（刺さり・言い回し）' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${item.color.split(' ')[0]} flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${item.color.split(' ')[1]}`}>{i + 1}</span>
                      </div>
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
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
                    <img
                      src="/haruki_icon.jpg"
                      alt="ハルキ"
                      className="w-full h-full object-cover"
                    />
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

      {/* 入力エリア */}
      <div className="flex-shrink-0 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="h-20 rounded-xl"
              />
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              type="text"
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              placeholder="補足コメント（任意）"
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
