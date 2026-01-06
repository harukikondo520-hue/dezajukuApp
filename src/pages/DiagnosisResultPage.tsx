import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Share2, Zap, Target, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateDiagnosisResult } from '../utils/diagnosisCalc';

export default function DiagnosisResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const answers: number[] = location.state?.answers || [];
  const result = answers.length === 18 ? calculateDiagnosisResult(answers) : null;

  // 結果を保存
  useEffect(() => {
    const saveResult = async () => {
      if (!user || !result || saved || saving) return;

      setSaving(true);
      try {
        const { data: existing } = await supabase
          .from('skill_diagnosis')
          .select('id')
          .eq('user_id', user.id)
          .single();

        const diagnosisData = {
          user_id: user.id,
          designer_type: result.typeCode,
          design_skill: 0,
          planning_skill: 0,
          client_skill: 0,
          business_skill: 0,
          mindset_skill: 0,
          raw_answers: answers,
          score_logic: result.scores.logic,
          score_emotion: result.scores.emotion,
          score_craft: result.scores.craft,
          score_business: result.scores.business,
          score_self: result.scores.self,
          score_others: result.scores.others,
          axis_thinking: result.axes.thinking,
          axis_weapon: result.axes.weapon,
          axis_engine: result.axes.engine,
        };

        if (existing) {
          await supabase
            .from('skill_diagnosis')
            .update(diagnosisData)
            .eq('id', existing.id);
        } else {
          await supabase
            .from('skill_diagnosis')
            .insert(diagnosisData);
        }

        setSaved(true);
      } catch (error) {
        console.error('診断結果の保存に失敗:', error);
      } finally {
        setSaving(false);
      }
    };

    saveResult();
  }, [user, result, saved, saving, answers]);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">診断データがありません</p>
          <button
            onClick={() => navigate('/diagnosis')}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold"
          >
            診断を始める
          </button>
        </div>
      </div>
    );
  }

  const { scores, typeCode, typeInfo } = result;

  const handleShare = () => {
    const text = `私のデザイナータイプは「${typeInfo.name}」でした！\n\n${typeInfo.tagline}\n\n#デザジュク #デザイナー診断`;
    const url = window.location.origin;
    
    if (navigator.share) {
      navigator.share({ title: 'デザイナータイプ診断', text, url });
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <Home className="w-6 h-6 text-slate-600" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <Share2 className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* メインカード */}
        <div className="px-4">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}cc 100%)` }}
          >
            {/* イラスト */}
            <div className="flex justify-center pt-8 pb-4">
              <img
                src="https://i.ibb.co/cKzhRLcc/DEZAHUKU-red-1.png"
                alt="デザイナータイプ"
                className="w-40 h-40 object-contain"
              />
            </div>

            {/* タイプ情報 */}
            <div className="text-center text-white px-6 pb-8">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3">
                Group {typeInfo.group} - {typeInfo.group === 'A' ? '自分起点' : '他者起点'}
              </div>
              <div className="text-5xl font-black mb-2 tracking-wider number-display">
                {typeCode}
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {typeInfo.name}
              </h1>
              <p className="text-white/80 text-sm mb-2">
                {typeInfo.combination}
              </p>
              <p className="text-lg font-medium italic">
                "{typeInfo.tagline}"
              </p>
            </div>
          </div>
        </div>

        {/* 3軸バーグラフ */}
        <div className="px-4 py-6">
          <h3 className="font-bold text-slate-800 mb-4">あなたの3つの軸</h3>

          <AxisBar
            label="思考OS"
            labelA="Logic"
            labelB="Emotion"
            scoreA={scores.logic}
            scoreB={scores.emotion}
            colorA="#3b82f6"
            colorB="#f59e0b"
          />
          <AxisBar
            label="武器種"
            labelA="Craft"
            labelB="Business"
            scoreA={scores.craft}
            scoreB={scores.business}
            colorA="#22c55e"
            colorB="#8b5cf6"
          />
          <AxisBar
            label="エンジン"
            labelA="Self"
            labelB="Others"
            scoreA={scores.self}
            scoreB={scores.others}
            colorA="#ef4444"
            colorB="#06b6d4"
          />
        </div>

        {/* 特徴 */}
        <div className="px-4 pb-6">
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              ✨ あなたの特徴
            </h3>
            <ul className="space-y-2">
              {typeInfo.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 0→1アクション */}
        <div className="px-4 pb-6">
          <div 
            className="rounded-2xl p-5 text-white"
            style={{ backgroundColor: typeInfo.color }}
          >
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              0→1 アクション
            </h3>
            <p className="text-sm leading-relaxed text-white/90">
              {typeInfo.action}
            </p>
          </div>
        </div>

        {/* 武器 */}
        <div className="px-4 pb-6">
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: typeInfo.color }} />
              あなたの武器
            </h3>
            <div className="flex flex-wrap gap-2">
              {typeInfo.weapons.map((weapon, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}
                >
                  {weapon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 勝ち筋 */}
        <div className="px-4 pb-6">
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              勝ち筋
            </h3>
            <p className="text-sm leading-relaxed text-slate-200">
              {typeInfo.winningStrategy}
            </p>
          </div>
        </div>

        {/* ホームへ戻るボタン */}
        <div className="px-4 pb-8">
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl
              hover:bg-slate-200 transition-all duration-200"
          >
            ホームへ戻る
          </button>
        </div>

        {saving && (
          <p className="text-center text-sm text-slate-400 pb-4">
            結果を保存中...
          </p>
        )}
      </div>
    </div>
  );
}

// 軸バーコンポーネント
function AxisBar({
  label,
  labelA,
  labelB,
  scoreA,
  scoreB,
  colorA,
  colorB,
}: {
  label: string;
  labelA: string;
  labelB: string;
  scoreA: number;
  scoreB: number;
  colorA: string;
  colorB: string;
}) {
  const total = scoreA + scoreB;
  const percentA = total > 0 ? Math.round((scoreA / total) * 100) : 50;
  const percentB = 100 - percentA;
  const winner = scoreA >= scoreB ? 'A' : 'B';

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold w-16 ${winner === 'A' ? '' : 'opacity-50'}`}
          style={{ color: colorA }}
        >
          {labelA}
        </span>
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${percentA}%`, backgroundColor: colorA }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${percentB}%`, backgroundColor: colorB }}
          />
        </div>
        <span
          className={`text-xs font-bold w-16 text-right ${winner === 'B' ? '' : 'opacity-50'}`}
          style={{ color: colorB }}
        >
          {labelB}
        </span>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-slate-400">{percentA}%</span>
        <span className="text-slate-400">{percentB}%</span>
      </div>
    </div>
  );
}
