import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Sparkles } from 'lucide-react';
import { calculateSkillScores, determineDesignerType } from '../lib/diagnosisCalculator';
import { designerTypes, skillLabels } from '../data/questions';
import { SkillScores, DesignerType } from '../types/diagnosis';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function DiagnosisResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scores, setScores] = useState<SkillScores | null>(null);
  const [designerType, setDesignerType] = useState<DesignerType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const answers = location.state?.answers;
    if (!answers) {
      navigate('/onboarding/diagnosis');
      return;
    }

    const calculatedScores = calculateSkillScores(answers);
    const type = determineDesignerType(calculatedScores);

    setScores(calculatedScores);
    setDesignerType(type);

    if (user) {
      saveDiagnosis(calculatedScores, type, answers);
    }
  }, [location.state, user]);

  const saveDiagnosis = async (
    scores: SkillScores,
    type: DesignerType,
    answers: Record<string, number>
  ) => {
    setSaving(true);
    try {
      await supabase.from('skill_diagnosis').upsert({
        user_id: user!.id,
        design_skill: scores.design,
        planning_skill: scores.planning,
        client_skill: scores.client,
        business_skill: scores.business,
        mindset_skill: scores.mindset,
        designer_type: type,
        raw_answers: answers,
        diagnosed_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('診断結果の保存に失敗:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!scores || !designerType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const typeInfo = designerTypes[designerType];

  const chartData = [
    { skill: '造形力', value: scores.design, fullMark: 100 },
    { skill: '設計力', value: scores.planning, fullMark: 100 },
    { skill: 'CW力', value: scores.client, fullMark: 100 },
    { skill: 'ビジネス力', value: scores.business, fullMark: 100 },
    { skill: 'マインド力', value: scores.mindset, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">あなたのデザイナータイプ</span>
          </div>

          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: typeInfo.color }}
          >
            {typeInfo.name}
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed">
            {typeInfo.description}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <h2 className="text-center text-sm font-medium text-gray-500 mb-4">
            スキルマップ
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickCount={6}
                />
                <Radar
                  name="スキル"
                  dataKey="value"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4">スコア詳細</h2>

          <div className="space-y-4">
            {Object.entries(scores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{skillLabels[key as keyof typeof skillLabels]}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl
            hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '次へ進む'}
        </button>
      </div>
    </div>
  );
}
