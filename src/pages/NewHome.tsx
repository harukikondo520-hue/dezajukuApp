import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Palette, ClipboardList, Users, Mail, Lightbulb } from 'lucide-react';
import { useDiagnosisResult } from '../hooks/useDiagnosis';
import { designerTypes } from '../data/questions';
import { DesignerTypeCode } from '../types/diagnosis';

// AI一覧データ（4つの添削AI）
const aiCards = [
  {
    id: 'design_review',
    name: 'デザイン添削',
    description: 'デザインを画像で送って添削',
    icon: Palette,
    color: '#ef4444',
    bgColor: 'bg-red-50',
    mode: 'design_review',
  },
  {
    id: 'sixstep_review',
    name: '6STEP添削',
    description: '6STEPシートの添削',
    icon: ClipboardList,
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    mode: 'sixstep_review',
  },
  {
    id: 'client_review',
    name: 'クライアントワーク添削',
    description: 'クライアント対応の相談',
    icon: Users,
    color: '#22c55e',
    bgColor: 'bg-green-50',
    mode: 'client_review',
  },
  {
    id: 'sales_review',
    name: '営業文添削',
    description: '営業文・提案文の添削',
    icon: Mail,
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    mode: 'sales_review',
  },
];

export default function NewHome() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  // 診断結果を取得
  const { data: diagnosis } = useDiagnosisResult(user?.id);
  
  // 新タイプシステム対応
  const typeCode = diagnosis?.designer_type as DesignerTypeCode | undefined;
  const typeInfo = typeCode && designerTypes[typeCode] ? designerTypes[typeCode] : null;

  // AIカードをタップしたときの処理
  const handleAICardClick = (mode: string) => {
    navigate(`/chat?mode=${mode}`);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 簡易プロフィールカード */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full mb-8"
        >
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ 
              background: typeInfo 
                ? `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}cc 100%)`
                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                <img
                  src="/dezajuku_icon_0531_1-05 copy.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold">{profile?.name || 'ゲスト'}</h2>
                {typeInfo ? (
                  <>
                    <p className="text-white/90 font-medium">{typeInfo.name}</p>
                    <p className="text-white/70 text-sm">{typeInfo.combination}</p>
                  </>
                ) : (
                  <p className="text-white/70 text-sm">タイプ未診断</p>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* AI一覧セクション */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">AIに相談する</h2>
          <div className="grid grid-cols-2 gap-3">
            {aiCards.map((ai) => {
              const Icon = ai.icon;
              return (
                <button
                  key={ai.id}
                  onClick={() => handleAICardClick(ai.mode)}
                  className={`${ai.bgColor} rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: ai.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">{ai.name}</h3>
                  <p className="text-xs text-slate-500">{ai.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 今日のワンポイント */}
        <div className="bg-slate-50 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">今日のワンポイント</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {typeInfo && (
                  <span className="font-medium" style={{ color: typeInfo.color }}>
                    「{typeInfo.name}」
                  </span>
                )}
                {typeInfo ? 'のあなたへ：' : ''}
                <br />
                {getTodaysTip()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
