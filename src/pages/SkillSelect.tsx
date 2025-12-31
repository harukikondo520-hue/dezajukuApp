import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSkillDiagnosis } from '../hooks/useDiagnosis';
import { skillCategoryNames } from '../data/skillQuestions';

// スキル項目の設定
const skillItems = [
  { 
    key: 'design', 
    name: skillCategoryNames.design, 
    type: 'image' as const,
    icon: Image,
    color: '#ef4444',
    description: 'デザイン作品をアップロードして診断'
  },
  { 
    key: 'planning', 
    name: skillCategoryNames.planning, 
    type: 'image' as const,
    icon: Image,
    color: '#3b82f6',
    description: '設計資料をアップロードして診断'
  },
  { 
    key: 'client', 
    name: skillCategoryNames.client, 
    type: 'chat' as const,
    icon: MessageCircle,
    color: '#f59e0b',
    description: 'AIとの対話で診断'
  },
  { 
    key: 'business', 
    name: skillCategoryNames.business, 
    type: 'chat' as const,
    icon: MessageCircle,
    color: '#22c55e',
    description: 'AIとの対話で診断'
  },
  { 
    key: 'mindset', 
    name: skillCategoryNames.mindset, 
    type: 'chat' as const,
    icon: MessageCircle,
    color: '#8b5cf6',
    description: 'AIとの対話で診断'
  },
];

export default function SkillSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: skillDiagnosis } = useSkillDiagnosis(user?.id);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <div>
            <h1 className="font-bold text-slate-900">スキル診断</h1>
            <p className="text-xs text-slate-500">診断したいスキルを選択</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-3">
          {skillItems.map((item) => {
            const Icon = item.icon;
            const score = getSkillScore(item.key);
            const isDiagnosed = score !== null && score > 0;
            
            return (
              <button
                key={item.key}
                onClick={() => navigate(`/skill-diagnosis/${item.key}`)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-slate-100"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={24} style={{ color: item.color }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {isDiagnosed && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <div className="text-right">
                  {isDiagnosed ? (
                    <div>
                      <p className="text-xl font-black number-display" style={{ color: item.color }}>{score}</p>
                      <p className="text-xs text-slate-400">点</p>
                    </div>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: item.color }}>診断 →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          各スキルをタップして診断を開始
        </p>
      </div>
    </div>
  );
}

