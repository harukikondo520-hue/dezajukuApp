import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, RotateCcw, Zap, Target, Trophy, ChevronRight } from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerTypeCode } from '../types/diagnosis';

// 3軸バーグラフコンポーネント
function AxisBarChart({
  labelA,
  labelB,
  scoreA,
  scoreB,
  colorA = '#3b82f6',
  colorB = '#ef4444',
}: {
  labelA: string;
  labelB: string;
  scoreA: number;
  scoreB: number;
  colorA?: string;
  colorB?: string;
}) {
  const total = scoreA + scoreB || 1;
  const percentA = Math.round((scoreA / total) * 100);
  const percentB = 100 - percentA;
  const dominant = percentA >= 50 ? 'A' : 'B';

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-medium ${dominant === 'A' ? 'text-slate-900' : 'text-slate-400'}`}>
          {labelA}
        </span>
        <span className={`font-medium ${dominant === 'B' ? 'text-slate-900' : 'text-slate-400'}`}>
          {labelB}
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percentA}%`, backgroundColor: colorA }}
        />
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percentB}%`, backgroundColor: colorB }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{percentA}%</span>
        <span>{percentB}%</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  
  // 新タイプシステム対応
  const typeCode = diagnosis?.designer_type as DesignerTypeCode | undefined;
  const typeInfo = typeCode && designerTypes[typeCode] ? designerTypes[typeCode] : null;

  // スコアデータ（仮データ - 実際のDBから取得する）
  const scores = {
    logic: diagnosis?.score_logic || 6,
    emotion: diagnosis?.score_emotion || 6,
    craft: diagnosis?.score_craft || 6,
    business: diagnosis?.score_business || 6,
    self: diagnosis?.score_self || 6,
    others: diagnosis?.score_others || 6,
  };

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/login');
    }
  };

  const handleRetakeDiagnosis = () => {
    if (confirm('診断をやり直すと、現在の結果は上書きされます。よろしいですか？')) {
      navigate('/diagnosis');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="px-4 py-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 text-center">プロフィール</h1>
        </div>

        {/* ユーザー情報 */}
        <div className="px-4 py-6 border-b border-slate-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 mb-3">
              <img
                src="/dezajuku_icon_0531_1-05 copy.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile?.name || 'ゲスト'}</h2>
            <p className="text-sm text-slate-500">{user?.email || ''}</p>
          </div>
        </div>

        {/* 診断結果セクション */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">あなたのタイプ</h2>

          {typeInfo ? (
            <>
              {/* タイプカード */}
              <div
                className="rounded-2xl overflow-hidden mb-6"
                style={{ background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}cc 100%)` }}
              >
                <div className="p-6 text-white text-center">
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3">
                    Group {typeInfo.group}
                  </div>
                  <div className="text-5xl font-black mb-2 tracking-wider number-display">
                    {typeCode}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {typeInfo.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-2">
                    {typeInfo.combination}
                  </p>
                  <p className="text-lg font-medium italic">
                    "{typeInfo.tagline}"
                  </p>
                </div>
              </div>

              {/* 3つの軸 */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-4">
                <h3 className="font-bold text-slate-800 mb-4">3つの軸</h3>
                
                <AxisBarChart
                  labelA="Logic（論理）"
                  labelB="Emotion（感情）"
                  scoreA={scores.logic}
                  scoreB={scores.emotion}
                  colorA="#3b82f6"
                  colorB="#ef4444"
                />
                
                <AxisBarChart
                  labelA="Craft（職人）"
                  labelB="Business（商売）"
                  scoreA={scores.craft}
                  scoreB={scores.business}
                  colorA="#22c55e"
                  colorB="#f59e0b"
                />
                
                <AxisBarChart
                  labelA="Self（自分）"
                  labelB="Others（他者）"
                  scoreA={scores.self}
                  scoreB={scores.others}
                  colorA="#8b5cf6"
                  colorB="#06b6d4"
                />
              </div>

              {/* 0→1アクション */}
              <div 
                className="rounded-2xl p-5 text-white mb-4"
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

              {/* 武器 */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-4">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: typeInfo.color }} />
                  あなたの武器
                </h3>
                <ul className="space-y-2">
                  {typeInfo.weapons.map((weapon, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{weapon}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 勝ち筋 */}
              <div className="bg-slate-900 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  勝ち筋
                </h3>
                <p className="text-sm leading-relaxed text-slate-200">
                  {typeInfo.winningStrategy}
                </p>
              </div>
            </>
          ) : (
            /* 未診断の場合 */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                まずは診断を受けよう
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                あなたのデザイナータイプを診断して<br />
                最適な戦略を見つけましょう
              </p>
              <button
                onClick={() => navigate('/diagnosis')}
                className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition"
              >
                診断を始める
              </button>
            </div>
          )}
        </div>

        {/* 設定セクション */}
        <div className="px-4 py-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide">設定</h2>
          
          <button
            onClick={handleRetakeDiagnosis}
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-3 hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-slate-500" />
              <span className="font-medium text-slate-700">診断をやり直す</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-600">ログアウト</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

