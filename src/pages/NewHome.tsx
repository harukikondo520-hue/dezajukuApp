import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wallet, ChevronRight, Sparkles, 
  Settings, LogOut, RefreshCw, BarChart3
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

// スキル名からスキルタイプを取得
const getSkillTypeFromName = (skillName: string): string => {
  switch (skillName) {
    case skillCategoryNames.design: return 'design';
    case skillCategoryNames.planning: return 'planning';
    case skillCategoryNames.client: return 'client';
    case skillCategoryNames.business: return 'business';
    case skillCategoryNames.mindset: return 'mindset';
    default: return 'design';
  }
};

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

  // スキルラベルクリック時の処理
  const handleSkillClick = (skillName: string) => {
    const skillType = getSkillTypeFromName(skillName);
    navigate(`/skill-diagnosis/${skillType}`);
  };

  // 機能グリッド
  const features = [
    { icon: Wallet, label: '収入記録', color: 'bg-emerald-500', path: '/income-management' },
    { icon: Sparkles, label: '総合診断', color: 'bg-gradient-to-br from-red-500 to-orange-500', path: '/comprehensive-diagnosis' },
  ];

  // リストメニュー
  const menuItems = [
    { icon: Settings, label: '設定', path: '/settings' },
  ];

  // スキルレーダーチャートデータ（常に表示、未診断は0）
  const skillData = [
    { skill: skillCategoryNames.design, value: skillDiagnosis?.design_skill || 0, key: 'design' },
    { skill: skillCategoryNames.planning, value: skillDiagnosis?.planning_skill || 0, key: 'planning' },
    { skill: skillCategoryNames.client, value: skillDiagnosis?.client_skill || 0, key: 'client' },
    { skill: skillCategoryNames.business, value: skillDiagnosis?.business_skill || 0, key: 'business' },
    { skill: skillCategoryNames.mindset, value: skillDiagnosis?.mindset_skill || 0, key: 'mindset' },
  ];

  // カスタムラベルコンポーネント
  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const skillName = payload.value;
    const skillType = getSkillTypeFromName(skillName);
    const score = skillData.find(s => s.skill === skillName)?.value || 0;
    const isDiagnosed = score > 0;
    
    return (
      <g 
        transform={`translate(${x},${y})`}
        onClick={() => handleSkillClick(skillName)}
        style={{ cursor: 'pointer' }}
      >
        <text
          x={0}
          y={0}
          dy={0}
          textAnchor="middle"
          fill={isDiagnosed ? '#374151' : '#9ca3af'}
          fontSize={10}
          fontWeight={isDiagnosed ? 600 : 400}
          className="hover:fill-red-600 transition-colors"
        >
          {skillName}
        </text>
        <text
          x={0}
          y={12}
          textAnchor="middle"
          fill={isDiagnosed ? '#ef4444' : '#d1d5db'}
          fontSize={9}
          fontWeight={600}
        >
          {isDiagnosed ? `${score}点` : 'タップで診断'}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
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

        {/* === 個人情報セクション === */}
        <div className="bg-white pb-4">
          {/* プロフィールカード */}
          <div className="px-4 pt-4">
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
                    <p className="text-sm text-slate-500">{typeInfo.name}</p>
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

          {/* デザイナータイプカード */}
          {typeInfo ? (
            <div className="px-4 mt-4">
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
              className="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white cursor-pointer"
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

          {/* スキルグラフ（常に表示） */}
          <div className="px-4 mt-4">
            <div className="bg-slate-50 rounded-2xl overflow-hidden">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-500" />
                    スキルバランス
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">各項目をタップして診断</p>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={skillData} outerRadius={70}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis 
                        dataKey="skill" 
                        tick={<CustomTick />}
                        tickLine={false}
                      />
                      <Radar
                        dataKey="value"
                        stroke={typeInfo ? typeInfo.color : '#3b82f6'}
                        fill={typeInfo ? typeInfo.color : '#3b82f6'}
                        fillOpacity={hasAnySkillDiagnosis ? 0.3 : 0.1}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === セクション区切り === */}
        <div className="h-3 bg-slate-100" />

        {/* === アクションセクション === */}
        <div className="bg-white pt-4 pb-4">
          <div className="px-4 mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">アクション</p>
          </div>

          {/* 機能グリッド（2列） */}
          <div className="mx-4 bg-slate-50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 gap-0">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isNotLastColumn = index < features.length - 1;
                
                return (
                  <button
                    key={feature.label}
                    onClick={() => navigate(feature.path)}
                    className={`flex flex-col items-center gap-2 py-5 hover:bg-slate-100 transition-all ${
                      isNotLastColumn ? 'border-r border-slate-200' : ''
                    }`}
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
          <div className="mx-4 mt-4 bg-slate-50 rounded-2xl overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === menuItems.length - 1;
              
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-100 transition-all ${
                    !isLast ? 'border-b border-slate-200' : ''
                  }`}
                >
                  <Icon size={20} className="text-slate-400" />
                  <span className="flex-1 text-left text-slate-700 font-medium">{item.label}</span>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ログアウトボタン */}
        <div className="px-4 py-6">
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
