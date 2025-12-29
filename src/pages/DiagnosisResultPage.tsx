import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Download, Share2, CheckCircle, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

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
    const fromValueDiagnosis = location.state?.fromValueDiagnosis;
    
    if (!fromValueDiagnosis) {
      const answers = location.state?.answers;
      const exAnswers = location.state?.exAnswers;
      navigate('/value-diagnosis', {
        state: {
          answers,
          exAnswers,
          designerType: designerType?.id,
        }
      });
    } else {
      navigate('/onboarding/goal');
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
    const answers = location.state?.answers;
    navigate('/value-diagnosis', {
      state: {
        answers,
        exAnswers: null,
        designerType: designerType?.id,
      }
    });
  };

  const handleDownloadImage = async () => {
    if (!resultCardRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `デザイナータイプ診断_${typeInfo.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('画像のダウンロードに失敗:', error);
      alert('画像のダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `私のデザイナータイプは「${typeInfo.name}」でした！`,
        text: `デザジュクでデザイナータイプ診断を受けた結果、「${typeInfo.name}」でした！\n\n${typeInfo.description}`,
        url: window.location.origin,
      }).catch((error) => {
        console.error('シェアに失敗:', error);
      });
    } else {
      // Web Share API非対応の場合
      alert('この機能はお使いのブラウザでは利用できません。画像をダウンロードしてSNSでシェアしてください。');
    }
  };

  const saveDiagnosis = async (
    scores: SkillScores,
    type: DesignerType,
    answers: Record<string, number>,
    exAnswers?: any[]
  ) => {
    setSaving(true);
    try {
      // diagnosisテーブルに保存（プロフィール表示用）
      await supabase.from('diagnosis').upsert({
        user_id: user!.id,
        designer_type: type,
        answers: answers,
        ex_answers: exAnswers ? {
          values: exAnswers[0]?.answer || null,
          vision: exAnswers[1]?.answer || null,
          strength: exAnswers[2]?.answer || null,
          challenge: exAnswers[3]?.answer || null,
          style: exAnswers[4]?.answer || null,
        } : null,
        values: [], // 価値観診断は後で入力
      }, { onConflict: 'user_id' });

      // skill_diagnosisテーブルにも保存（スキルグラフ表示用）
      await supabase.from('skill_diagnosis').upsert({
        user_id: user!.id,
        design_skill: scores.design,
        planning_skill: scores.planning,
        client_skill: scores.client,
        business_skill: scores.business,
        mindset_skill: scores.mindset,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ダウンロード用カード */}
        <div ref={resultCardRef} className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-2" style={{ borderColor: typeInfo.color }}>
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-red-600" />
              <span className="text-sm font-bold text-red-600">デザイナータイプ診断</span>
            </div>

            <div className="mb-6">
              <div className="inline-block p-6 rounded-full mb-4" style={{ background: `linear-gradient(135deg, ${typeInfo.color}20, ${typeInfo.color}10)` }}>
                <Sparkles className="w-16 h-16" style={{ color: typeInfo.color }} />
              </div>
            </div>

            <h1 className="text-4xl font-black mb-4" style={{ color: typeInfo.color }}>
              {typeInfo.name}
            </h1>

            <p className="text-slate-700 leading-relaxed text-lg px-4">
              {typeInfo.description}
            </p>
          </div>

          {/* 著名デザイナー */}
          {typeInfo.famousDesigners && typeInfo.famousDesigners.length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 text-center">
                同じタイプの著名デザイナー
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {typeInfo.famousDesigners.map((designer, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-white rounded-xl shadow-sm border-2"
                    style={{ borderColor: `${typeInfo.color}40` }}
                  >
                    <span className="font-bold text-slate-900">{designer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ロゴ/ブランディング */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-semibold">
              デザジュク - デザイナータイプ診断
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
            結果をシェアしよう
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              <Download size={20} />
              {isDownloading ? '生成中...' : '画像保存'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg"
            >
              <Share2 size={20} />
              シェア
            </button>
          </div>
        </div>

        {/* 次のステップ */}
        {!hasExAnswers ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                さらに詳しく診断しますか？
              </h3>
              <p className="text-sm text-slate-600">
                デザイナータイプ診断EXで、より深い自己理解が得られます
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleTakeExDiagnosis}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg"
              >
                <Sparkles size={20} />
                デザイナータイプ診断EXを受ける
              </button>
              <button
                onClick={handleSkipExDiagnosis}
                className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-300"
              >
                スキップして次へ進む
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg"
          >
            次へ進む
            <ArrowRight size={20} />
          </button>
        )}

        {/* スキル診断への誘導 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 mb-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-purple-900 mb-2">
              次はスキル診断もお試しください
            </h4>
            <p className="text-sm text-purple-700 mb-4">
              デザイナータイプとは別に、5つのスキル領域を詳しく診断できます
            </p>
            <button
              onClick={() => navigate('/skill-diagnosis')}
              className="px-6 py-2 bg-white text-purple-700 font-bold rounded-lg hover:bg-purple-50 transition-all duration-300 shadow-md"
            >
              スキル診断を受ける
            </button>
          </div>
        </div>

        {/* ホームへ戻るボタン */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300"
        >
          <Home size={20} />
          ホームへ戻る
        </button>

      </div>
    </div>
  );
}
