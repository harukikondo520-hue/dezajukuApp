import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ClipboardCheck } from 'lucide-react';
import { calculateSkillScores, determineDesignerType } from '../lib/diagnosisCalculator';
import { designerTypes } from '../data/questions';
import { SkillScores, DesignerType } from '../types/diagnosis';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function DiagnosisResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [scores, setScores] = useState<SkillScores | null>(null);
  const [designerType, setDesignerType] = useState<DesignerType | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasExAnswers, setHasExAnswers] = useState(false);

  useEffect(() => {
    const answers = location.state?.answers;
    const exAnswers = location.state?.exAnswers;

    if (!answers) {
      navigate('/diagnosis');
      return;
    }

    const calculatedScores = calculateSkillScores(answers);
    const type = determineDesignerType(calculatedScores);

    setScores(calculatedScores);
    setDesignerType(type);
    setHasExAnswers(!!exAnswers);

    if (user) {
      saveDiagnosis(calculatedScores, type, answers, exAnswers);
    }
  }, [location.state, user]);

  const handleNext = () => {
    if (profile?.onboarding_completed) {
      navigate('/');
    } else {
      navigate('/onboarding');
    }
  };

  const handleTakeExDiagnosis = () => {
    const answers = location.state?.answers;
    navigate('/diagnosis', {
      state: {
        startWithEx: true,
        basicAnswers: answers
      }
    });
  };

  const handleSkipExDiagnosis = () => {
    handleNext();
  };

  const saveDiagnosis = async (
    scores: SkillScores,
    type: DesignerType,
    answers: Record<string, number>,
    exAnswers?: any[]
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
        ex_answers: exAnswers ? {
          values: exAnswers[0]?.answer || null,
          vision: exAnswers[1]?.answer || null,
          strength: exAnswers[2]?.answer || null,
          challenge: exAnswers[3]?.answer || null,
          style: exAnswers[4]?.answer || null,
        } : null,
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

          <p className="text-gray-600 text-sm leading-relaxed px-4">
            {typeInfo.description}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-full mb-4">
              <Sparkles className="w-12 h-12" style={{ color: typeInfo.color }} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              詳しいスキル診断は別途受けることができます。<br />
              まずはあなたのデザイナータイプを確認して、<br />
              自分の強みを理解しましょう！
            </p>
          </div>
        </div>

        {hasExAnswers ? (
          <button
            onClick={handleNext}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl
              hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '次へ進む'}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleTakeExDiagnosis}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl
                hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ClipboardCheck size={20} />
              デザイナータイプ診断EXを受ける
            </button>
            
            <button
              onClick={handleSkipExDiagnosis}
              disabled={saving}
              className="w-full py-4 border-2 border-slate-300 text-slate-700 font-medium rounded-2xl
                hover:bg-slate-50 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              スキップして次へ進む
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
