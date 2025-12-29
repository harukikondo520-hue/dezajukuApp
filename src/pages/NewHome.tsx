import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Wallet, ChevronRight, Sparkles } from 'lucide-react';

export default function NewHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // 時間帯に応じた挨拶
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'おはようございます';
    if (hour < 18) return 'こんにちは';
    return 'こんばんは';
  };

  // 提案された質問
  const suggestedQuestions = [
    { id: 1, text: '単価を上げるには？', emoji: '💰' },
    { id: 2, text: '営業文の書き方', emoji: '✍️' },
    { id: 3, text: '自分に合った案件は？', emoji: '🎯' },
  ];

  // プロフィールアイコンURL
  const getProfileIcon = () => {
    if (profile?.icon) return profile.icon;
    const seed = profile?.name || profile?.id || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-500 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
              {profile?.name || 'ゲスト'}さん
            </h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-red-400 transition-all duration-300"
          >
            <img
              src={getProfileIcon()}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;
              }}
            />
          </button>
        </div>

        {/* AIチャットカード */}
        <div 
          onClick={() => navigate('/chat')}
          className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 mb-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Sparkles size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg mb-1">
                ハルキAIに相談する
              </h2>
              <p className="text-white/80 text-sm">
                案件・スキル・キャリアの悩みを解決
              </p>
            </div>
            <ChevronRight size={24} className="text-white/60" />
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900 font-bold">クイックアクション</h2>
          </div>
          
          <button
            onClick={() => navigate('/income-management')}
            className="w-full bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Wallet size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-slate-900">収入を記録する</p>
              <p className="text-xs text-slate-500 mt-0.5">案件の収入を管理</p>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>

        {/* おすすめの質問 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900 font-bold">こんな相談ができます</h2>
          </div>
          
          <div className="space-y-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate('/chat', { state: { initialQuestion: q.text } })}
                className="w-full bg-white rounded-xl p-4 border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300 flex items-center gap-3 group"
              >
                <span className="text-xl">{q.emoji}</span>
                <span className="flex-1 text-left font-medium text-slate-700 group-hover:text-slate-900">
                  {q.text}
                </span>
                <MessageCircle size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* フッタースペース */}
        <div className="h-20" />
      </div>
    </div>
  );
}
