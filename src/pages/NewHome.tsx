import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, Wallet, ChevronRight, Sparkles, 
  User, Settings, LogOut
} from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerType } from '../types/diagnosis';

// デザイナータイプアイコン
const getDesignerTypeIcon = (type: DesignerType, size = 24) => {
  const iconProps = { size, strokeWidth: 2 };
  switch (type) {
    case 'artist': return '🎨';
    case 'strategist': return '💡';
    case 'partner': return '🤝';
    case 'business_designer': return '📈';
    case 'growth': return '🚀';
    case 'all_rounder': return '⭐';
    default: return '⭐';
  }
};

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  const typeInfo = diagnosis?.designer_type ? designerTypes[diagnosis.designer_type as DesignerType] : null;

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/login');
    }
  };

  // 機能グリッド（2行2列）
  const features = [
    { icon: Wallet, label: '収入記録', color: 'bg-emerald-500', path: '/income-management' },
    { icon: MessageCircle, label: 'AI相談', color: 'bg-red-500', path: '/chat' },
    { icon: Sparkles, label: '総合診断', color: 'bg-gradient-to-br from-red-500 to-orange-500', path: '/comprehensive-diagnosis' },
    { icon: User, label: 'プロフィール', color: 'bg-purple-500', path: '/profile' },
  ];

  // リストメニュー
  const menuItems = [
    { icon: Settings, label: '設定', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto pb-8" style={{ maxWidth: '512px' }}>
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">マイページ</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <LogOut size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* プロフィールカード */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-slate-200">
                  <img
                    src="/dezajuku_icon_0531_1-05 copy.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{profile?.name || 'ゲスト'}</h2>
                  {typeInfo ? (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <span>{getDesignerTypeIcon(typeInfo.type, 14)}</span>
                      {typeInfo.name}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">タイプ未診断</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="text-sm text-red-600 font-medium"
              >
                詳細
              </button>
            </div>
          </div>
        </div>

        {/* AIバナー */}
        <div 
          className="mx-4 mt-3 rounded-2xl overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}
          onClick={() => navigate('/chat')}
        >
          <div className="px-5 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-md flex-shrink-0">
              <img
                src="/haruki_icon.jpg"
                alt="ハルキ"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-900">ハルキAIに相談する</p>
              <p className="text-sm text-red-700/70">キャリア・案件・スキルの悩みを解決</p>
            </div>
            <ChevronRight size={20} className="text-red-400" />
          </div>
        </div>

        {/* 機能グリッド（2行2列） */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-2 gap-0">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isLastRow = index >= 2;
              const isNotLastColumn = (index + 1) % 2 !== 0;
              
              return (
                <button
                  key={feature.label}
                  onClick={() => navigate(feature.path)}
                  className={`flex flex-col items-center gap-2 py-5 hover:bg-slate-50 transition-all ${
                    isNotLastColumn ? 'border-r border-slate-100' : ''
                  } ${!isLastRow ? 'border-b border-slate-100' : ''}`}
                >
                  <div className={`w-11 h-11 rounded-2xl ${feature.color} flex items-center justify-center shadow-sm`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{feature.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* リストメニュー */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === menuItems.length - 1;
            
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-all ${
                  !isLast ? 'border-b border-slate-100' : ''
                }`}
              >
                <Icon size={20} className="text-slate-400" />
                <span className="flex-1 text-left text-slate-700 font-medium">{item.label}</span>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            );
          })}
        </div>

        {/* ログアウトボタン */}
        <div className="mx-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">ログアウト</span>
          </button>
        </div>

      </div>
    </div>
  );
}
