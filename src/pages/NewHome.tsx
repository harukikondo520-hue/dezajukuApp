import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Palette, ClipboardList, Mail, ChevronRight } from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerTypeCode } from '../types/diagnosis';

// AI一覧データ（3つの添削AI）
const aiCards = [
  {
    id: 'design_review',
    name: 'デザイン添削',
    description: 'デザインを5つの観点で採点',
    icon: Palette,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    path: '/design-review',
  },
  {
    id: 'sixstep_review',
    name: '6STEP添削',
    description: '制作プロセスをチェック',
    icon: ClipboardList,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    path: '/sixstep-review',
  },
  {
    id: 'sales_review',
    name: '営業文添削',
    description: '提案文・営業文を改善',
    icon: Mail,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    path: '/sales-review',
  },
];

// ハルキの一言リスト
const harukiQuotes = [
  '本日もぶち上げ。',
  'デザインは愛。',
  '今日も最高の1日にしよう。',
  '行動した人だけが結果を出せる。',
  '自分を信じて進め。',
  '失敗は成功のもと。',
  'まずはやってみよう。',
  '継続は力なり。',
];

export default function NewHome() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  
  // 新タイプシステム対応
  const typeCode = diagnosis?.designer_type as DesignerTypeCode | undefined;
  const typeInfo = typeCode && designerTypes[typeCode] ? designerTypes[typeCode] : null;

  // AIカードをタップしたときの処理
  const handleAICardClick = (path: string) => {
    navigate(path);
  };

  // 日付に基づいてハルキの一言を選択（1日1つ固定）
  const getTodaysQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return harukiQuotes[dayOfYear % harukiQuotes.length];
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        
        {/* プロフィールカード */}
        <div className="bg-white rounded-3xl p-5">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-4 w-full"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                src="/dezajuku_icon_0531_1-05 copy.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-base font-bold text-slate-900">
                {profile?.name || 'ゲスト'}
              </h2>
              {typeInfo ? (
                <p className="text-sm text-slate-500">{typeInfo.name}</p>
              ) : (
                <p className="text-sm text-slate-400">タイプ未診断</p>
              )}
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* コンドウハルキの本日の一言 */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
              <img
                src="/haruki_icon.jpg"
                alt="コンドウハルキ"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-xs font-medium text-slate-400 mb-1">
                コンドウハルキの本日の一言
              </p>
              <p className="text-lg font-bold text-slate-900 leading-relaxed">
                「{getTodaysQuote()}」
              </p>
            </div>
          </div>
        </div>

        {/* AI添削メニュー */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 px-1">添削AIを使う</h3>
          
          {aiCards.map((ai) => {
            const Icon = ai.icon;
            return (
              <button
                key={ai.id}
                onClick={() => handleAICardClick(ai.path)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-50 transition"
              >
                <div className={`w-12 h-12 rounded-xl ${ai.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${ai.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 text-sm">{ai.name}</p>
                  <p className="text-xs text-slate-500">{ai.description}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
