import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Wallet, TrendingUp, Sparkles } from 'lucide-react';

export default function NewHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // 提案された質問
  const suggestedQuestions = [
    { id: 1, icon: TrendingUp, text: '単価を上げるには？', color: 'text-red-600' },
    { id: 2, icon: MessageCircle, text: '営業文の書き方', color: 'text-orange-600' },
    { id: 3, icon: Wallet, text: '自分に合った案件は？', color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* ヘッダー：ユーザー情報 */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-red-500 shadow-lg relative">
              {profile?.icon ? (
                <img
                  src={profile.icon}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 画像読み込み失敗時のフォールバック
                    e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile?.name || 'default');
                  }}
                />
              ) : (
                <img
                  src={'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile?.name || 'default')}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">こんにちは</p>
              <h1 className="text-2xl font-black text-slate-900">{profile?.name || 'ゲスト'}さん</h1>
            </div>
          </div>
        </div>

        {/* メインカード：AIへの導線 */}
        <div className="bg-white rounded-3xl p-8 mb-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start gap-4 mb-6">
            {/* ハルキアイコン */}
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0">
              <img
                src="/haruki_icon.jpg"
                alt="ハルキさん"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 画像読み込み失敗時のフォールバック
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center';
                    fallback.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                    e.currentTarget.parentElement.appendChild(fallback);
                  }
                }}
              />
            </div>
            
            <div className="flex-1">
              <p className="text-lg text-slate-700 font-medium leading-relaxed mb-4">
                今日は何について話しましょうか？
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="group flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-all duration-300"
              >
                AIに相談する
                <MessageCircle size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
            クイックアクション
          </h2>
          {/* 収入を記録する */}
          <button
            onClick={() => navigate('/income-management')}
            className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl inline-flex group-hover:scale-110 transition-transform duration-300">
                <Wallet size={24} className="text-red-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">収入を記録する</p>
                <p className="text-sm text-slate-500 mt-1">案件の収入を管理しましょう</p>
              </div>
            </div>
          </button>
        </div>

        {/* ハルキAIに聞いてみよう */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
            ハルキAIに聞いてみよう
          </h2>
          <div className="space-y-3">
            {suggestedQuestions.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.id}
                  onClick={() => navigate('/chat', { state: { initialQuestion: q.text } })}
                  className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 text-left group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform duration-300 ${q.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="font-bold text-slate-900">{q.text}</span>
                  </div>
                  <MessageCircle size={20} className="text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300" />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

