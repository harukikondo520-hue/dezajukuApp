import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Share2, Download, ChevronRight, Zap, Target, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateDiagnosisResult, calcAxisPercentage } from '../utils/diagnosisCalc';
import { DesignerTypeInfo, AxisScores, AxisResult, DesignerTypeCode } from '../types/diagnosis';

export default function DiagnosisResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const answers: number[] = location.state?.answers || [];

  // 診断結果を計算
  const result = answers.length === 18 ? calculateDiagnosisResult(answers) : null;

  // 結果を保存
  useEffect(() => {
    const saveResult = async () => {
      if (!user || !result || saved || saving) return;

      setSaving(true);
      try {
        // 既存の診断結果を確認
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

  const { scores, axes, typeCode, typeInfo } = result;

  // シェア機能
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Home className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* タイトル */}
        <div className="text-center mb-6">
          <p className="text-sm text-slate-500 mb-2">あなたのデザイナータイプは...</p>
        </div>

        {/* メインカード（MBTI風） */}
        <div
          className="rounded-3xl p-6 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}dd 100%)` }}
        >
          {/* 背景イラスト */}
          <div className="absolute right-4 bottom-4 opacity-20">
            <img
              src="https://i.ibb.co/cKzhRLcc/DEZAHUKU-red-1.png"
              alt=""
              className="w-32 h-32 object-contain"
            />
          </div>

          <div className="relative z-10">
            {/* グループバッジ */}
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3 backdrop-blur-sm">
              Group {typeInfo.group} - {typeInfo.group === 'A' ? '自分起点' : '他者起点'}
            </div>

            {/* タイプコード */}
            <div className="text-5xl font-black mb-2 tracking-wider number-display">
              {typeCode}
            </div>

            {/* タイプ名 */}
            <h1 className="text-2xl font-bold mb-2">
              {typeInfo.name}
            </h1>

            {/* 組み合わせ */}
            <p className="text-white/80 text-sm mb-3">
              {typeInfo.combination}
            </p>

            {/* タグライン */}
            <p className="text-lg font-medium italic">
              "{typeInfo.tagline}"
            </p>
          </div>
        </div>

        {/* 3軸バーグラフ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">あなたの3つの軸</h3>

          {/* 思考OS */}
          <AxisBar
            label="思考OS"
            labelA="Logic"
            labelB="Emotion"
            scoreA={scores.logic}
            scoreB={scores.emotion}
            colorA="#3b82f6"
            colorB="#f59e0b"
          />

          {/* 武器種 */}
          <AxisBar
            label="武器種"
            labelA="Craft"
            labelB="Business"
            scoreA={scores.craft}
            scoreB={scores.business}
            colorA="#22c55e"
            colorB="#8b5cf6"
          />

          {/* エンジン */}
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
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${typeInfo.color}20` }}>
              ✨
            </span>
            あなたの特徴
          </h3>
          <ul className="space-y-2">
            {typeInfo.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="text-slate-400 mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 0→1アクション */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-5 mb-6 text-white">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            0→1 アクション
          </h3>
          <p className="leading-relaxed">
            {typeInfo.action}
          </p>
        </div>

        {/* 武器 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
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

        {/* 勝ち筋 */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-6 text-white">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            勝ち筋
          </h3>
          <p className="leading-relaxed text-slate-200">
            {typeInfo.winningStrategy}
          </p>
        </div>

        {/* ホームへ戻るボタン */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl
            hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
        >
          ホームへ戻る
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 保存中表示 */}
        {saving && (
          <p className="text-center text-sm text-slate-400 mt-4">
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
