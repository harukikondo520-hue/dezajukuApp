import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wallet, Sparkles, 
  LogOut, BarChart3, User, Settings, ChevronRight
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

// タイプ別カラー
const getTypeColor = (type: DesignerType) => {
  switch (type) {
    case 'artist': return '#ef4444';
    case 'strategist': return '#3b82f6';
    case 'partner': return '#22c55e';
    case 'business_designer': return '#f59e0b';
    case 'growth': return '#8b5cf6';
    case 'all_rounder': return '#14b8a6';
    default: return '#ef4444';
  }
};

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  const { data: skillDiagnosis } = useSkillDiagnosis(user?.id);
  
  const typeInfo = diagnosis?.designer_type ? designerTypes[diagnosis.designer_type as DesignerType] : null;
  const typeColor = typeInfo ? getTypeColor(typeInfo.type) : '#6366f1';
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto pb-8" style={{ maxWidth: '512px' }}>
        
        {/* === 上部：アクションカード === */}
        <div className="bg-white pb-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="text-xl font-bold text-slate-900">マイページ</h1>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <LogOut size={20} className="text-slate-400" />
            </button>
          </div>

          {/* プロフィール情報 */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
                <img
                  src="/dezajuku_icon_0531_1-05 copy.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{profile?.name || 'ゲスト'}</h2>
                {typeInfo ? (
                  <p className="text-sm" style={{ color: typeColor }}>{typeInfo.name}</p>
                ) : (
                  <p className="text-sm text-slate-400">タイプ未診断</p>
                )}
              </div>
            </div>
          </div>

          {/* アクションボタン（シンプル版） */}
          <div className="grid grid-cols-4 px-4">
            {actionButtons.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 py-2 hover:opacity-70 transition-all"
                >
                  <Icon size={24} className="text-slate-600" />
                  <span className="text-xs text-slate-500">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 区切り */}
        <div className="h-2 bg-slate-100" />

        {/* === 下部：マイ情報 === */}
        <div className="bg-white">
          
          {/* デザイナータイプカード */}
          <div className="px-4 py-5 border-b border-slate-100">
            <p className="text-xs text-slate-400 mb-3">デザイナータイプ</p>
            {typeInfo ? (
              <div 
                className="bg-white rounded-2xl border-2 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                style={{ borderColor: typeColor }}
                onClick={() => navigate('/comprehensive-diagnosis')}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${typeColor}15` }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: typeColor }}
                        />
                      </div>
                      <span className="text-lg font-bold text-slate-900">{typeInfo.name}</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{typeInfo.description}</p>
                </div>
                <div 
                  className="px-4 py-2 text-xs font-medium text-center"
                  style={{ backgroundColor: `${typeColor}10`, color: typeColor }}
                >
                  タップして再診断
                </div>
              </div>
            ) : (
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white cursor-pointer hover:opacity-90 transition-all"
                onClick={() => navigate('/comprehensive-diagnosis')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">まずは診断を受けよう</p>
                    <p className="text-lg font-bold">デザイナー総合診断</p>
                  </div>
                  <Sparkles size={28} className="text-white/80" />
                </div>
              </div>
            )}
          </div>

          {/* スキルバランス */}
          <div className="px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-slate-400" />
                <span className="font-bold text-slate-900">スキルバランス</span>
              </div>
            </div>
            
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={skillData} outerRadius={90}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke={typeColor}
                    fill={typeColor}
                    fillOpacity={hasAnySkillDiagnosis ? 0.2 : 0.05}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* スキル診断ボタン */}
            <button
              onClick={() => navigate('/skill-select')}
              className="w-full mt-4 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: typeColor }}
            >
              {hasAnySkillDiagnosis ? 'スキル診断をやり直す' : 'スキル診断する'}
            </button>
          </div>

        </div>

        {/* フッタースペース */}
        <div className="h-8" />

      </div>
    </div>
  );
}
