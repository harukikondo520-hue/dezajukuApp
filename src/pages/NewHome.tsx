import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Wallet, ChevronRight, Sparkles, Palette, Lightbulb, Handshake, TrendingUp, Rocket, Star, User, RefreshCw, Heart } from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerType } from '../types/diagnosis';

// 今日の一言データ（今後追加予定）
const dailyQuotes = [
  '本日もぶち上げ。',
];

// 今日の一言を取得（日付ベースで固定）
const getTodayQuote = () => {
  const today = new Date();
  const index = today.getDate() % dailyQuotes.length;
  return dailyQuotes[index];
};

// デザイナータイプアイコン
const getDesignerTypeIcon = (type: DesignerType, size = 24) => {
  const iconProps = { size, strokeWidth: 2 };
  switch (type) {
    case 'artist': return <Palette {...iconProps} />;
    case 'strategist': return <Lightbulb {...iconProps} />;
    case 'partner': return <Handshake {...iconProps} />;
    case 'business_designer': return <TrendingUp {...iconProps} />;
    case 'growth': return <Rocket {...iconProps} />;
    case 'all_rounder': return <Star {...iconProps} />;
    default: return <Star {...iconProps} />;
  }
};

// タイプ別グラデーション
const getTypeGradient = (type: DesignerType) => {
  switch (type) {
    case 'artist': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    case 'strategist': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    case 'partner': return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    case 'business_designer': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    case 'growth': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    case 'all_rounder': return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
    default: return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  }
};

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  const typeInfo = diagnosis?.designer_type ? designerTypes[diagnosis.designer_type as DesignerType] : null;

  // 提案された質問
  const suggestedQuestions = [
    { id: 1, text: '単価を上げるには？' },
    { id: 2, text: '営業文の書き方' },
    { id: 3, text: '自分に合った案件は？' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto pt-4 pb-6 px-2 sm:px-4 bg-white" style={{ maxWidth: '512px' }}>
        
        {/* メインカード（V POINT Payスタイル） */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          {/* ヘッダー部分（赤背景 + キャラクター） */}
          <div 
            className="px-6 pt-6 pb-8 text-white relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
            }}
          >
            {/* 背景のキャラクター画像（大きく配置） */}
            <div 
              className="absolute pointer-events-none"
              style={{ bottom: '-14px', right: '4px' }}
            >
              <img 
                src="/home_character.png" 
                alt="" 
                className="h-48 w-auto"
                style={{ 
                  filter: 'drop-shadow(3px 3px 10px rgba(0,0,0,0.25))'
                }}
              />
            </div>
            
            {/* プロフィール情報 */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30">
                  <img
                    src="/dezajuku_icon_0531_1-05 copy.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white/70 text-sm">こんにちは</p>
                  <h1 className="text-2xl font-bold">{profile?.name || 'ゲスト'}さん</h1>
                </div>
              </div>
              
              {/* デザイナータイプ表示 */}
              {typeInfo ? (
                <div 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit cursor-pointer hover:bg-white/30 transition-all"
                >
                  {getDesignerTypeIcon(typeInfo.type, 18)}
                  <span className="font-bold">{typeInfo.name}</span>
                  <ChevronRight size={16} className="text-white/60" />
                </div>
              ) : (
                <div 
                  onClick={() => navigate('/diagnosis')}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit cursor-pointer hover:bg-white/30 transition-all"
                >
                  <Sparkles size={18} />
                  <span className="font-medium">診断を受けてタイプを知る</span>
                  <ChevronRight size={16} className="text-white/60" />
                </div>
              )}
            </div>
          </div>
          
          {/* アクションボタン（4列グリッド） */}
          <div className="grid grid-cols-4 gap-2 px-4 py-4 border-b border-slate-100">
            <button 
              onClick={() => navigate('/income-management')}
              className="flex flex-col items-center gap-2 py-3 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Wallet size={20} className="text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium">収入記録</span>
            </button>
            
            <button 
              onClick={() => navigate('/diagnosis')}
              className="flex flex-col items-center gap-2 py-3 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Sparkles size={20} className="text-red-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium">タイプ診断</span>
            </button>
            
            <button 
              onClick={() => navigate('/skill-diagnosis')}
              className="flex flex-col items-center gap-2 py-3 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium">スキル診断</span>
            </button>
            
            <button 
              onClick={() => navigate('/value-diagnosis')}
              className="flex flex-col items-center gap-2 py-3 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                <Heart size={20} className="text-pink-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium">価値観診断</span>
            </button>
          </div>
          
          {/* ハルキAIに相談するボタン */}
          <div 
            onClick={() => navigate('/chat')}
            className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-red-100">
              <img
                src="/haruki_icon.jpg"
                alt="ハルキ"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-red-500 flex items-center justify-center"><span class="text-white font-bold">H</span></div>';
                }}
              />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">ハルキAIに相談する</p>
              <p className="text-xs text-slate-500">案件・スキル・キャリアの悩みを解決</p>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </div>
        </div>

        {/* おすすめの質問 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900 font-bold">こんな相談ができます</h2>
            <button 
              onClick={() => navigate('/chat')}
              className="text-sm text-red-600 font-medium hover:underline"
            >
              すべて見る
            </button>
          </div>
          
          <div className="space-y-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate('/chat', { state: { initialQuestion: q.text } })}
                className="w-full bg-white rounded-xl p-4 border border-slate-200 hover:border-red-200 hover:shadow-md transition-all duration-300 flex items-center gap-3 group"
              >
                <span className="flex-1 text-left font-medium text-slate-700 group-hover:text-slate-900">
                  {q.text}
                </span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* フッタースペース */}
        <div className="h-24" />
      </div>
    </div>
  );
}

