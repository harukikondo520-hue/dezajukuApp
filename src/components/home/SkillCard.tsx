import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DiagnosisResult } from '../../types/diagnosis';
import { designerTypes } from '../../data/questions';

export default function SkillCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDiagnosis();
    }
  }, [user]);

  const fetchDiagnosis = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_diagnosis')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data && !error) {
        setDiagnosis(data);
      }
    } catch (error) {
      console.error('診断データの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <p className="text-center text-gray-500 text-sm mb-4">
          スキル診断がまだ完了していません
        </p>
        <button
          onClick={() => navigate('/onboarding/diagnosis')}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl"
        >
          診断を受ける
        </button>
      </div>
    );
  }

  const typeInfo = designerTypes[diagnosis.designer_type];

  const chartData = [
    { skill: '造形力', value: diagnosis.design_skill },
    { skill: '設計力', value: diagnosis.planning_skill },
    { skill: 'CW力', value: diagnosis.client_skill },
    { skill: 'ビジネス力', value: diagnosis.business_skill },
    { skill: 'マインド力', value: diagnosis.mindset_skill },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">あなたのスキルマップ</h3>
        <button
          onClick={() => navigate('/onboarding/diagnosis')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="再診断する"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <span
          className="px-4 py-1 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: typeInfo.color }}
        >
          {typeInfo.name}
        </span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Radar
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
  );
}
