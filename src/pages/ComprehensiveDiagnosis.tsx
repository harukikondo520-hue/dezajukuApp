import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles, TrendingUp, Heart, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { diagnosisQuestions, designerTypes } from '../data/questions';
import { skillQuestions, calculateSkillScore } from '../data/skillQuestions';
import { valueQuestions } from '../data/valueQuestions';
import { DesignerType } from '../types/diagnosis';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

type Step = 'intro' | 'type' | 'skill' | 'value' | 'result';

export default function ComprehensiveDiagnosis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [typeAnswers, setTypeAnswers] = useState<Record<number, number>>({});
  const [skillAnswers, setSkillAnswers] = useState<Record<number, number>>({});
  const [valueAnswers, setValueAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    designerType: DesignerType;
    skillScores: { design: number; planning: number; client: number; business: number; mindset: number };
    values: { questionId: number; question: string; answer: string }[];
  } | null>(null);

  // 進捗計算
  const getProgress = () => {
    const typeProgress = Object.keys(typeAnswers).length / diagnosisQuestions.length;
    const skillProgress = Object.keys(skillAnswers).length / skillQuestions.length;
    const valueProgress = Object.keys(valueAnswers).length / valueQuestions.length;
    
    if (currentStep === 'intro') return 0;
    if (currentStep === 'type') return typeProgress * 33;
    if (currentStep === 'skill') return 33 + skillProgress * 33;
    if (currentStep === 'value') return 66 + valueProgress * 34;
    return 100;
  };

  // タイプ診断の回答
  const handleTypeAnswer = (questionId: number, value: number) => {
    setTypeAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentQuestionIndex < diagnosisQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
    }
  };

  // スキル診断の回答
  const handleSkillAnswer = (questionId: number, score: number) => {
    setSkillAnswers(prev => ({ ...prev, [questionId]: score }));
    if (currentQuestionIndex < skillQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
    }
  };

  // 価値観診断の回答
  const handleValueAnswer = (questionId: number, answer: string) => {
    setValueAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // デザイナータイプを計算
  const calculateDesignerType = (): DesignerType => {
    const scores = {
      design: 0,
      planning: 0,
      client: 0,
      business: 0,
      mindset: 0,
    };

    diagnosisQuestions.forEach(q => {
      const answer = typeAnswers[q.id];
      if (answer !== undefined) {
        scores[q.category] += answer;
      }
    });

    const maxCategory = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const avgScore = totalScore / 5;

    // スコアのバランスをチェック
    const variance = Object.values(scores).reduce((acc, score) => acc + Math.pow(score - avgScore, 2), 0) / 5;
    
    if (variance < 2) return 'all_rounder';

    const typeMap: Record<string, DesignerType> = {
      design: 'artist',
      planning: 'strategist',
      client: 'partner',
      business: 'business_designer',
      mindset: 'growth',
    };

    return typeMap[maxCategory];
  };

  // 次のステップへ
  const goToNextStep = () => {
    if (currentStep === 'intro') {
      setCurrentStep('type');
      setCurrentQuestionIndex(0);
    } else if (currentStep === 'type') {
      setCurrentStep('skill');
      setCurrentQuestionIndex(0);
    } else if (currentStep === 'skill') {
      setCurrentStep('value');
      setCurrentQuestionIndex(0);
    } else if (currentStep === 'value') {
      handleSubmit();
    }
  };

  // 前のステップへ
  const goToPrevStep = () => {
    if (currentStep === 'type') {
      setCurrentStep('intro');
    } else if (currentStep === 'skill') {
      setCurrentStep('type');
      setCurrentQuestionIndex(diagnosisQuestions.length - 1);
    } else if (currentStep === 'value') {
      setCurrentStep('skill');
      setCurrentQuestionIndex(skillQuestions.length - 1);
    }
  };

  // 結果を保存
  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const designerType = calculateDesignerType();
      const skillScores = calculateSkillScore(skillAnswers);
      const valuesJson = valueQuestions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: valueAnswers[q.id] || '',
      }));

      // データベースに保存
      const { error } = await supabase
        .from('skill_diagnosis')
        .upsert({
          user_id: user.id,
          designer_type: designerType,
          design_skill: skillScores.design,
          planning_skill: skillScores.planning,
          client_skill: skillScores.client,
          business_skill: skillScores.business,
          mindset_skill: skillScores.mindset,
          raw_answers: typeAnswers,
          skill_answers: skillAnswers,
          values: valuesJson,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setResult({
        designerType,
        skillScores,
        values: valuesJson,
      });
      setCurrentStep('result');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // イントロ画面
  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg">
        <Sparkles size={40} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">デザイナー総合診断</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        約10分であなたのデザイナータイプ、スキルレベル、価値観を総合的に診断します。
        AIがこの結果を元にパーソナライズされたアドバイスを提供します。
      </p>
      
      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">1</div>
          <div className="text-left">
            <p className="font-medium text-slate-900">タイプ診断</p>
            <p className="text-sm text-slate-500">あなたのデザイナータイプを判定</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
          <div className="text-left">
            <p className="font-medium text-slate-900">スキル診断</p>
            <p className="text-sm text-slate-500">5つのスキルレベルを測定</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">3</div>
          <div className="text-left">
            <p className="font-medium text-slate-900">価値観診断</p>
            <p className="text-sm text-slate-500">大切にしていることを記録</p>
          </div>
        </div>
      </div>

      <button
        onClick={goToNextStep}
        className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        診断を始める
      </button>
    </div>
  );

  // タイプ診断画面
  const renderTypeDiagnosis = () => {
    const question = diagnosisQuestions[currentQuestionIndex];
    const answer = typeAnswers[question.id];

    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-red-600 font-medium">STEP 1</span>
            <span className="text-sm text-slate-400">タイプ診断</span>
          </div>
          <p className="text-sm text-slate-500">
            {currentQuestionIndex + 1} / {diagnosisQuestions.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <p className="text-lg font-bold text-slate-900 mb-6">{question.text}</p>
          
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleTypeAnswer(question.id, value)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  answer === value
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {value === 1 && '全く当てはまらない'}
                    {value === 2 && 'あまり当てはまらない'}
                    {value === 3 && 'どちらとも言えない'}
                    {value === 4 && 'やや当てはまる'}
                    {value === 5 && 'とても当てはまる'}
                  </span>
                  {answer === value && <Check size={20} className="text-red-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(prev => prev - 1) : goToPrevStep()}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            戻る
          </button>
          <button
            onClick={() => {
              if (currentQuestionIndex === diagnosisQuestions.length - 1 && Object.keys(typeAnswers).length === diagnosisQuestions.length) {
                goToNextStep();
              } else if (answer !== undefined) {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }}
            disabled={answer === undefined}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {currentQuestionIndex === diagnosisQuestions.length - 1 ? '次のステップへ' : '次へ'}
          </button>
        </div>
      </div>
    );
  };

  // スキル診断画面
  const renderSkillDiagnosis = () => {
    const question = skillQuestions[currentQuestionIndex];
    const answer = skillAnswers[question.id];

    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-blue-600 font-medium">STEP 2</span>
            <span className="text-sm text-slate-400">スキル診断</span>
          </div>
          <p className="text-sm text-slate-500">
            {currentQuestionIndex + 1} / {skillQuestions.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <p className="text-lg font-bold text-slate-900 mb-6">{question.question}</p>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSkillAnswer(question.id, option.score)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  answer === option.score
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.text}</span>
                  {answer === option.score && <Check size={20} className="text-blue-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(prev => prev - 1) : goToPrevStep()}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            戻る
          </button>
          <button
            onClick={() => {
              if (currentQuestionIndex === skillQuestions.length - 1 && Object.keys(skillAnswers).length === skillQuestions.length) {
                goToNextStep();
              } else if (answer !== undefined) {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }}
            disabled={answer === undefined}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {currentQuestionIndex === skillQuestions.length - 1 ? '次のステップへ' : '次へ'}
          </button>
        </div>
      </div>
    );
  };

  // 価値観診断画面
  const renderValueDiagnosis = () => (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-pink-600 font-medium">STEP 3</span>
          <span className="text-sm text-slate-400">価値観診断</span>
        </div>
        <p className="text-sm text-slate-500">最後のステップです</p>
      </div>

      <div className="space-y-4 mb-6">
        {valueQuestions.map((q, index) => (
          <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {index + 1}
              </span>
              <p className="font-bold text-slate-900">{q.question}</p>
            </div>
            <textarea
              value={valueAnswers[q.id] || ''}
              onChange={(e) => handleValueAnswer(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={goToPrevStep}
          className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          戻る
        </button>
        <button
          onClick={goToNextStep}
          disabled={isSubmitting || Object.keys(valueAnswers).length < valueQuestions.length}
          className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              保存中...
            </>
          ) : (
            '診断結果を見る'
          )}
        </button>
      </div>
    </div>
  );

  // 結果画面
  const renderResult = () => {
    if (!result) return null;
    
    const typeInfo = designerTypes[result.designerType];
    const radarData = [
      { skill: '造形力', value: result.skillScores.design, fullMark: 100 },
      { skill: '設計力', value: result.skillScores.planning, fullMark: 100 },
      { skill: 'CW力', value: result.skillScores.client, fullMark: 100 },
      { skill: 'ビジネス力', value: result.skillScores.business, fullMark: 100 },
      { skill: 'マインド力', value: result.skillScores.mindset, fullMark: 100 },
    ];

    return (
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">診断完了！</h1>
          <p className="text-slate-600">あなたの診断結果</p>
        </div>

        {/* デザイナータイプ */}
        <div 
          className="rounded-2xl p-6 text-white mb-4 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}dd 100%)` }}
        >
          <p className="text-white/70 text-sm mb-1">あなたのタイプ</p>
          <h2 className="text-2xl font-bold mb-2">{typeInfo.name}</h2>
          <p className="text-white/90 text-sm">{typeInfo.description}</p>
        </div>

        {/* スキルグラフ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-4">
          <h3 className="font-bold text-slate-900 mb-4">スキルバランス</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="スキル"
                  dataKey="value"
                  stroke={typeInfo.color}
                  fill={typeInfo.color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 価値観 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-900 mb-4">あなたの価値観</h3>
          <div className="space-y-4">
            {result.values.map((v, index) => (
              <div key={index}>
                <p className="text-sm text-slate-500 mb-1">{v.question}</p>
                <p className="text-slate-900 font-medium">{v.answer || '未回答'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/chat')}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            AIにアドバイスをもらう
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* プログレスバー */}
      {currentStep !== 'intro' && currentStep !== 'result' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-blue-500 to-pink-500 transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      )}

      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-40">
        <div className="flex items-center justify-between px-4 py-3" style={{ maxWidth: '512px', margin: '0 auto' }}>
          <button
            onClick={() => currentStep === 'intro' || currentStep === 'result' ? navigate('/') : goToPrevStep()}
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-slate-900">
            {currentStep === 'intro' && 'デザイナー総合診断'}
            {currentStep === 'type' && 'タイプ診断'}
            {currentStep === 'skill' && 'スキル診断'}
            {currentStep === 'value' && '価値観診断'}
            {currentStep === 'result' && '診断結果'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: '512px', margin: '0 auto' }}>
        {currentStep === 'intro' && renderIntro()}
        {currentStep === 'type' && renderTypeDiagnosis()}
        {currentStep === 'skill' && renderSkillDiagnosis()}
        {currentStep === 'value' && renderValueDiagnosis()}
        {currentStep === 'result' && renderResult()}
      </div>
    </div>
  );
}

