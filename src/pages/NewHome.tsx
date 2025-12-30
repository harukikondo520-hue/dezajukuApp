import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, Wallet, ChevronRight, Sparkles, 
  User, Settings, LogOut, RefreshCw, BarChart3
} from 'lucide-react';
import { useDiagnosisResult, useSkillDiagnosis } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { skillCategoryNames } from '../data/skillQuestions';
import { DesignerType } from '../types/diagnosis';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

// デザイナータイプアイコン（絵文字版）
const getDesignerTypeEmoji = (type: DesignerType) => {
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
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  const { data: skillDiagnosis } = useSkillDiagnosis(user?.id);
  
  const typeInfo = diagnosis?.designer_type ? designerTypes[diagnosis.designer_type as DesignerType] : null;
  const hasSkillDiagnosis = !!skillDiagnosis?.design_skill;

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

  // スキルレーダーチャートデータ
  const skillData = hasSkillDiagnosis ? [
    { skill: skillCategoryNames.design, value: skillDiagnosis?.design_skill || 0 },
    { skill: skillCategoryNames.planning, value: skillDiagnosis?.planning_skill || 0 },
    { skill: skillCategoryNames.client, value: skillDiagnosis?.client_skill || 0 },
    { skill: skillCategoryNames.business, value: skillDiagnosis?.business_skill || 0 },
    { skill: skillCategoryNames.mindset, value: skillDiagnosis?.mindset_skill || 0 },
  ] : null;

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
                      <span>{getDesignerTypeEmoji(typeInfo.type)}</span>
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
                編集
              </button>
            </div>
          </div>
        </div>

        {/* デザイナータイプカード */}
        {typeInfo ? (
          <div className="mx-4 mt-3">
            <div
              className="p-5 rounded-2xl text-white relative overflow-hidden cursor-pointer"
              style={{ background: getTypeGradient(typeInfo.type) }}
              onClick={() => navigate('/comprehensive-diagnosis')}
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20">
                {getDesignerTypeEmoji(typeInfo.type)}
              </div>
              <div className="relative z-10">
                <p className="text-white/70 text-xs mb-1">あなたのタイプ</p>
                <h3 className="text-xl font-bold mb-1">{typeInfo.name}</h3>
                <p className="text-white/80 text-xs line-clamp-2">{typeInfo.description}</p>
              </div>
              <div className="absolute bottom-3 right-3">
                <RefreshCw size={16} className="text-white/50" />
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="mx-4 mt-3 p-5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white cursor-pointer"
            onClick={() => navigate('/comprehensive-diagnosis')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">まずは診断を受けよう</p>
                <h3 className="text-lg font-bold">デザイナー総合診断</h3>
              </div>
              <Sparkles size={32} className="text-white/80" />
            </div>
          </div>
        )}

        {/* スキルグラフ（診断済みの場合） */}
        {hasSkillDiagnosis && skillData && (
          <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-500" />
                  スキルバランス
                </h3>
                <button
                  onClick={() => navigate('/comprehensive-diagnosis')}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <RefreshCw size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="h-48" style={{ minHeight: 180, minWidth: 180 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={180}>
                  <RadarChart data={skillData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar
                      dataKey="value"
                      stroke={typeInfo ? typeInfo.color : '#3b82f6'}
                      fill={typeInfo ? typeInfo.color : '#3b82f6'}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

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
