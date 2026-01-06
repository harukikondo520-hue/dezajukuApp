import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ChevronRight, Zap, Target, Trophy } from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerTypeCode } from '../types/diagnosis';

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  
  // 新タイプシステム対応
  const typeCode = diagnosis?.designer_type as DesignerTypeCode | undefined;
  const typeInfo = typeCode && designerTypes[typeCode] ? designerTypes[typeCode] : null;

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900">プロフィール</h1>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <LogOut size={20} className="text-slate-400" />
          </button>
        </div>

        {/* プロフィール情報 */}
        <div className="px-4 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
              <img
                src="/dezajuku_icon_0531_1-05 copy.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.name || 'ゲスト'}</h2>
              {typeInfo ? (
                <p className="text-sm font-medium" style={{ color: typeInfo.color }}>
                  {typeCode} - {typeInfo.name}
                </p>
              ) : (
                <p className="text-sm text-slate-400">タイプ未診断</p>
              )}
            </div>
          </div>
        </div>

        {/* 診断結果 */}
        {typeInfo ? (
          <div className="px-4 py-6">
            {/* メインカード */}
            <div
              className="rounded-2xl overflow-hidden mb-6"
              style={{ background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}cc 100%)` }}
            >
              <div className="p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    Group {typeInfo.group}
                  </div>
                  <button
                    onClick={() => navigate('/diagnosis')}
                    className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                  >
                    再診断 <ChevronRight size={14} />
                  </button>
                </div>
                <div className="text-4xl font-black mb-1 tracking-wider number-display">
                  {typeCode}
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {typeInfo.name}
                </h3>
                <p className="text-white/80 text-sm">
                  {typeInfo.combination}
                </p>
                <p className="text-base font-medium italic mt-2">
                  "{typeInfo.tagline}"
                </p>
              </div>
            </div>

            {/* 特徴 */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-800 mb-3">✨ あなたの特徴</h3>
              <ul className="space-y-2">
                {typeInfo.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
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
            <div className="bg-slate-900 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                勝ち筋
              </h3>
              <p className="text-sm leading-relaxed text-slate-200">
                {typeInfo.winningStrategy}
              </p>
            </div>
          </div>
        ) : (
          /* 未診断の場合 */
          <div className="px-4 py-12">
            <div className="text-center">
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
          </div>
        )}

        {/* フッタースペース */}
        <div className="h-4" />
      </div>
    </div>
  );
}
