import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Palette, ClipboardList, Users, Mail, ChevronRight, Lightbulb, MessageCircle } from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerTypeCode } from '../types/diagnosis';

// AI一覧データ（4つの添削AI）
const aiCards = [
  {
    id: 'design_review',
    name: 'デザイン添削',
    description: '画像で添削',
    icon: Palette,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    path: '/design-review',
  },
  {
    id: 'sixstep_review',
    name: '6STEP添削',
    description: '制作プロセス',
    icon: ClipboardList,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    path: '/sixstep-review',
  },
  {
    id: 'client_review',
    name: 'クライアント',
    description: '対応相談',
    icon: Users,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    path: '/client-review',
  },
  {
    id: 'sales_review',
    name: '営業文添削',
    description: '提案文添削',
    icon: Mail,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
    path: '/sales-review',
  },
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

  // 今日のワンポイント（タイプに応じたTips）
  const getTodaysTip = () => {
    if (!typeInfo) {
      return '診断を受けて、あなた専用のアドバイスを受け取りましょう！';
    }
    
    const tips: Record<string, string> = {
      LCS: '技術力を武器に、今日も1pxにこだわっていきましょう。',
      ECS: '今日も自分の世界観を大切に。作品が誰かの心を動かします。',
      LBS: '自分のプロダクトを育てましょう。今日の1%が明日の100%に。',
      EBS: '発信を止めるな。今日のあなたの言葉が誰かを救う。',
      LCO: '今日も「整理整頓」の力で、誰かの仕事を楽にしましょう。',
      ECO: '今日もヒアリングを大切に。相手の想いを形にしていきましょう。',
      LBO: '数字で語れるデザイナーは強い。今日も「売上」にこだわりましょう。',
      EBO: '今日もチームの空気を作りましょう。あなたがいるから回っている。',
    };
    
    return tips[typeCode as string] || typeInfo.action;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        
        {/* プロフィールカード */}
        <div className="bg-white rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              {profile?.name || 'ゲスト'}
            </h2>
            <button 
              onClick={() => navigate('/profile')}
              className="text-sm text-cyan-500 font-medium"
            >
              プロフィール
            </button>
          </div>
          
          {typeInfo ? (
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: typeInfo.color + '20' }}
                >
                  <span style={{ color: typeInfo.color }} className="text-xs">✦</span>
                </div>
                <span className="text-sm text-slate-700">{typeInfo.name}</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/diagnosis')}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-xs">?</span>
                </div>
                <span className="text-sm text-slate-500">タイプ診断を受ける</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* ハルキAIへの相談カード */}
        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-3xl p-5">
          <button 
            onClick={() => navigate('/chat')}
            className="flex items-center gap-4 w-full text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              <img 
                src="/haruki_icon.jpg" 
                alt="ハルキ" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-0.5">
                ハルキAIに相談しよう
              </h3>
              <p className="text-white/80 text-sm">
                何でも気軽に質問してね！
              </p>
            </div>
            <ChevronRight size={20} className="text-white/80" />
          </button>
        </div>

        {/* AI添削メニュー */}
        <div className="bg-white rounded-3xl p-5">
          <div className="grid grid-cols-4 gap-4">
            {aiCards.map((ai) => {
              const Icon = ai.icon;
              return (
                <button
                  key={ai.id}
                  onClick={() => handleAICardClick(ai.path)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-12 h-12 ${ai.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${ai.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-800 leading-tight">{ai.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 今日のワンポイント */}
        <div className="bg-white rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm mb-1">今日のワンポイント</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {typeInfo && (
                  <span className="font-medium" style={{ color: typeInfo.color }}>
                    「{typeInfo.name}」
                  </span>
                )}
                {typeInfo ? 'のあなたへ：' : ''}
                {getTodaysTip()}
              </p>
            </div>
          </div>
        </div>

        {/* リンクセクション */}
        <div className="bg-white rounded-3xl overflow-hidden">
          <button 
            onClick={() => navigate('/chat')}
            className="flex items-center gap-4 w-full px-5 py-4 hover:bg-slate-50 transition"
          >
            <MessageCircle size={20} className="text-slate-400" />
            <span className="flex-1 text-left text-sm font-medium text-slate-700">
              過去のチャット履歴
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <div className="h-px bg-slate-100 mx-5" />
          <button 
            onClick={() => navigate('/diagnosis')}
            className="flex items-center gap-4 w-full px-5 py-4 hover:bg-slate-50 transition"
          >
            <span className="text-slate-400">🎯</span>
            <span className="flex-1 text-left text-sm font-medium text-slate-700">
              タイプ診断をやり直す
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
