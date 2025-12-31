import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wallet, ChevronRight, Sparkles, 
  Settings, LogOut, RefreshCw, BarChart3, User
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

// スキル診断カードの設定（グラデーション付き）
const skillCards = [
  { key: 'design', name: skillCategoryNames.design, gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  { key: 'planning', name: skillCategoryNames.planning, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { key: 'client', name: skillCategoryNames.client, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { key: 'business', name: skillCategoryNames.business, gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
  { key: 'mindset', name: skillCategoryNames.mindset, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
];

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  const { data: skillDiagnosis } = useSkillDiagnosis(user?.id);
  
  const typeInfo = diagnosis?.designer_type ? designerTypes[diagnosis.designer_type as DesignerType] : null;
  const hasAnySkillDiagnosis = !!(
    skillDiagnosis?.design_skill ||
    skillDiagnosis?.planning_skill ||
    skillDiagnosis?.client_skill ||
    skillDiagnosis?.business_skill ||
    skillDiagnosis?.mindset_skill
  );

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/login');
    }
  };

  // スキルスコアを取得
  const getSkillScore = (key: string): number | null => {
    if (!skillDiagnosis) return null;
    switch (key) {
      case 'design': return skillDiagnosis.design_skill;
      case 'planning': return skillDiagnosis.planning_skill;
      case 'client': return skillDiagnosis.client_skill;
      case 'business': return skillDiagnosis.business_skill;
      case 'mindset': return skillDiagnosis.mindset_skill;
      default: return null;
    }
  };

  // アクションボタン
  const actionButtons = [
    { icon: Wallet, label: '収入記録', path: '/income-management' },
    { icon: Sparkles, label: '総合診断', path: '/comprehensive-diagnosis' },
    { icon: User, label: 'プロフィール', path: '/profile' },
    { icon: Settings, label: '設定', path: '/settings' },
  ];

  // スキルレーダーチャートデータ
  const skillData = [
    { skill: skillCategoryNames.design, value: skillDiagnosis?.design_skill || 0 },
    { skill: skillCategoryNames.planning, value: skillDiagnosis?.planning_skill || 0 },
    { skill: skillCategoryNames.client, value: skillDiagnosis?.client_skill || 0 },
    { skill: skillCategoryNames.business, value: skillDiagnosis?.business_skill || 0 },
    { skill: skillCategoryNames.mindset, value: skillDiagnosis?.mindset_skill || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto pb-8" style={{ maxWidth: '512px' }}>
        
        {/* === 上部：アクションカード === */}
        <div className="bg-white rounded-b-3xl shadow-sm pb-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="text-xl font-bold text-slate-900">マイページ</h1>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <LogOut size={20} className="text-slate-500" />
            </button>
          </div>

          {/* メインカード */}
          <div className="mx-4 bg-slate-50 rounded-2xl p-5">
            {/* プロフィール情報 */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-200">
                <img
                  src="/dezajuku_icon_0531_1-05 copy.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">{profile?.name || 'ゲスト'}</h2>
                {typeInfo ? (
                  <p className="text-sm text-slate-500">{typeInfo.name}</p>
                ) : (
                  <p className="text-sm text-slate-400">タイプ未診断</p>
                )}
              </div>
            </div>

            {/* アクションボタン（4つ横並び） */}
            <div className="grid grid-cols-4 gap-2">
              {actionButtons.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <Icon size={20} className="text-slate-600" />
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* === 下部：マイ情報セクション === */}
        <div className="px-4 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">マイ情報</p>
        </div>

        {/* デザイナータイプカード */}
        {typeInfo ? (
          <div className="px-4">
            <div
              className="p-5 rounded-2xl text-white relative overflow-hidden cursor-pointer"
              style={{ background: getTypeGradient(typeInfo.type) }}
              onClick={() => navigate('/comprehensive-diagnosis')}
            >
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
            className="mx-4 p-5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white cursor-pointer"
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

        {/* スキルグラフ */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-2 py-4">
              <div className="flex items-center justify-center mb-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-500" />
                  スキルバランス
                </h3>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={skillData} outerRadius={100}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke={typeInfo ? typeInfo.color : '#6366f1'}
                      fill={typeInfo ? typeInfo.color : '#6366f1'}
                      fillOpacity={hasAnySkillDiagnosis ? 0.25 : 0.1}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* スキル診断カード（横スクロール） */}
        <div className="mt-4">
          <div className="px-4 mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">スキル診断</p>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 pb-2" style={{ width: 'max-content' }}>
              {skillCards.map((card) => {
                const score = getSkillScore(card.key);
                const isDiagnosed = score !== null && score > 0;
                
                return (
                  <button
                    key={card.key}
                    onClick={() => navigate(`/skill-diagnosis/${card.key}`)}
                    className="flex-shrink-0 w-20 rounded-2xl p-3 text-white transition-all hover:opacity-90 hover:scale-105"
                    style={{ background: card.gradient }}
                  >
                    <p className="text-xs font-bold text-white/90 mb-1 truncate">{card.name}</p>
                    {isDiagnosed ? (
                      <p className="text-lg font-black">{score}<span className="text-xs">点</span></p>
                    ) : (
                      <p className="text-xs font-semibold text-white/80">診断 →</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* フッタースペース */}
        <div className="h-8" />

      </div>
    </div>
  );
}
