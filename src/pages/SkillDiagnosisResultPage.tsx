import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Home } from 'lucide-react';
import { calculateSkillScore, skillCategoryNames } from '../data/skillQuestions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SkillDiagnosisResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scores, setScores] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const answers = location.state?.answers;

    if (!answers) {
      navigate('/skill-diagnosis');
      return;
    }

    const calculatedScores = calculateSkillScore(answers);
    setScores(calculatedScores);

    if (user) {
      saveSkillDiagnosis(calculatedScores, answers);
    }
  }, [location.state, user]);

  const saveSkillDiagnosis = async (scores: any, answers: Record<number, number>) => {
    setSaving(true);
    try {
      // 既存のデータを取得（designer_typeを引き継ぐため）
      const { data: existing } = await supabase
        .from('skill_diagnosis')
        .select('designer_type, raw_answers')
        .eq('user_id', user!.id)
        .maybeSingle();

      // skill_diagnosisテーブルを更新
      const { error } = await supabase.from('skill_diagnosis').upsert({
        user_id: user!.id,
        designer_type: existing?.designer_type || 'all_rounder', // デフォルト値
        design_skill: scores.design,
        planning_skill: scores.planning,
        client_skill: scores.client,
        business_skill: scores.business,
        mindset_skill: scores.mindset,
        raw_answers: existing?.raw_answers || {},
        skill_answers: answers,
        diagnosed_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

      if (error) {
        console.error('スキル診断結果の保存エラー:', error);
        alert(`保存に失敗しました: ${error.message}`);
      } else {
        console.log('スキル診断結果を保存しました');
      }
    } catch (error: any) {
      console.error('スキル診断結果の保存に失敗:', error);
      alert(`保存に失敗しました: ${error.message || 'エラーが発生しました'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!scores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const chartData = [
    { skill: skillCategoryNames.design, value: scores.design },
    { skill: skillCategoryNames.planning, value: scores.planning },
    { skill: skillCategoryNames.client, value: scores.client },
    { skill: skillCategoryNames.business, value: scores.business },
    { skill: skillCategoryNames.mindset, value: scores.mindset },
  ];

  const averageScore = Math.round(
    (scores.design + scores.planning + scores.client + scores.business + scores.mindset) / 5
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">スキル診断結果</span>
          </div>

          <h1 className="text-3xl font-bold mb-3 text-blue-600">
            総合スコア: {averageScore}点
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed px-4">
            あなたの5つのスキル領域を分析しました
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
                <Radar
                  name="スキル"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
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
                  <span className="text-gray-700">{skillCategoryNames[key as keyof typeof skillCategoryNames]}</span>
                  <span className="font-bold text-gray-900">{value as number}点</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGoHome}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl
            hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Home size={20} />
          {saving ? '保存中...' : 'ホームへ戻る'}
        </button>
      </div>
    </div>
  );
}

