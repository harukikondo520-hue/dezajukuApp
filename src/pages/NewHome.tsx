import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wallet, Sparkles, 
  LogOut, BarChart3, User, Settings, ChevronRight
} from 'lucide-react';
import { useDiagnosisResult, useSkillDiagnosis } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { skillCategoryNames } from '../data/skillQuestions';
import { DesignerTypeCode } from '../types/diagnosis';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  const { data: skillDiagnosis } = useSkillDiagnosis(user?.id);
  
  // 新タイプシステム対応
  const typeCode = diagnosis?.designer_type as DesignerTypeCode | undefined;
  const typeInfo = typeCode && designerTypes[typeCode] ? designerTypes[typeCode] : null;
  const typeColor = typeInfo?.color || '#ef4444';
  
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
                  <p className="text-sm font-medium" style={{ color: typeColor }}>
                    {typeCode} - {typeInfo.name}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">タイプ未診断</p>
                )}
              </div>
            </div>
          </div>

          {/* アクションボタン（シンプル版） */}
          <div className="grid grid-cols-3 px-4">
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
                className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)` }}
                onClick={() => navigate('/diagnosis')}
              >
                <div className="p-4 text-white relative">
                  {/* 背景イラスト */}
                  <div className="absolute right-2 bottom-2 opacity-20">
                    <img
                      src="https://i.ibb.co/cKzhRLcc/DEZAHUKU-red-1.png"
                      alt=""
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  
                  <div className="relative z-10">
                    {/* グループバッジ */}
                    <div className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold mb-2">
                      Group {typeInfo.group}
                    </div>
                    
                    {/* タイプコード */}
                    <div className="text-3xl font-black mb-1 number-display tracking-wider">
                      {typeCode}
                    </div>
                    
                    {/* タイプ名 */}
                    <h3 className="text-lg font-bold mb-1">
                      {typeInfo.name}
                    </h3>
                    
                    {/* タグライン */}
                    <p className="text-white/80 text-sm">
                      {typeInfo.tagline}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-black/10 text-white/90 text-xs font-medium text-center flex items-center justify-center gap-1">
                  タップして詳細・再診断
                  <ChevronRight size={14} />
                </div>
              </div>
            ) : (
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white cursor-pointer hover:opacity-90 transition-all"
                onClick={() => navigate('/diagnosis')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">まずは診断を受けよう</p>
                    <p className="text-lg font-bold">デザイナータイプ診断</p>
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
