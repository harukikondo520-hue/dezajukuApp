import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { valueQuestions, ValueAnswer } from '../data/valueQuestions';

export default function ValueDiagnosisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [valueAnswers, setValueAnswers] = useState<ValueAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DiagnosisPageから渡された基本診断の回答データ
  const { answers, exAnswers, designerType } = location.state || {};

  const handleAnswerChange = (questionId: number, answer: string) => {
    setValueAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || valueAnswers.length < valueQuestions.length) {
      alert('すべての質問に回答してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // 価値観回答をJSON配列形式に変換
      const valuesJson = valueAnswers.map(va => ({
        questionId: va.questionId,
        question: valueQuestions.find(q => q.id === va.questionId)?.question || '',
        answer: va.answer,
      }));

      // 診断結果を保存（タイプ診断 + 価値観診断）
      const { error: diagnosisError } = await supabase
        .from('diagnosis')
        .upsert({
          user_id: user.id,
          designer_type: designerType,
          answers: answers || {},
          ex_answers: exAnswers || null,
          values: valuesJson,
        }, { onConflict: 'user_id' });

      if (diagnosisError) throw diagnosisError;

      // スキル診断も同時に保存（タイプ診断の回答から計算済み）
      const skillScores = calculateSkillScores(answers);
      const { error: skillError } = await supabase
        .from('skill_diagnosis')
        .upsert({
          user_id: user.id,
          design_skill: skillScores.design,
          planning_skill: skillScores.planning,
          client_skill: skillScores.client,
          business_skill: skillScores.business,
          mindset_skill: skillScores.mindset,
          skill_answers: answers || {},
          values: valuesJson,
        }, { onConflict: 'user_id' });

      if (skillError) throw skillError;

      // 診断結果ページへ遷移
      navigate('/diagnosis/result', {
        state: {
          designerType,
          skillScores,
          values: valuesJson,
          fromValueDiagnosis: true,
        }
      });

    } catch (error) {
      console.error('Error saving value diagnosis:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // タイプ診断の回答からスキルスコアを計算
  const calculateSkillScores = (answers: any) => {
    if (!answers || typeof answers !== 'object') {
      return { design: 0, planning: 0, client: 0, business: 0, mindset: 0 };
    }

    const answerValues = Object.values(answers).map(v => Number(v) || 0);
    
    // Q1-4: 造形力、Q5-8: 設計力、Q9-12: CW力、Q13-16: ビジネス力、Q17-20: マインド力
    const design = Math.round((answerValues.slice(0, 4).reduce((a, b) => a + b, 0) / 4) * 20);
    const planning = Math.round((answerValues.slice(4, 8).reduce((a, b) => a + b, 0) / 4) * 20);
    const client = Math.round((answerValues.slice(8, 12).reduce((a, b) => a + b, 0) / 4) * 20);
    const business = Math.round((answerValues.slice(12, 16).reduce((a, b) => a + b, 0) / 4) * 20);
    const mindset = Math.round((answerValues.slice(16, 20).reduce((a, b) => a + b, 0) / 4) * 20);

    return { design, planning, client, business, mindset };
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">戻る</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">価値観診断</h1>
              <p className="text-slate-600 mt-1">あなたの価値観を教えてください</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 bg-white rounded-xl p-4 border border-slate-200">
            AIがあなたに最適なアドバイスをするために、デザイナーとしての価値観を教えてください。
          </p>
        </div>

        {/* 質問フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {valueQuestions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <label className="block">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-lg font-bold text-slate-900 flex-1 pt-1">
                    {q.question}
                  </p>
                </div>
                <textarea
                  value={valueAnswers.find(va => va.questionId === q.id)?.answer || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </label>
            </div>
          ))}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || valueAnswers.length < valueQuestions.length}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                保存中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                診断結果を見る
              </>
            )}
          </button>

          {/* ホームへ戻るボタン */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            ホームへ戻る
          </button>
        </form>
      </div>
    </div>
  );
}

