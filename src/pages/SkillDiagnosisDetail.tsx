import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Upload, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { sendMessageToDify } from '../lib/difyApi';
import { skillCategoryNames } from '../data/skillQuestions';

type SkillType = 'design' | 'planning' | 'client' | 'business' | 'mindset';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// スキルタイプごとの設定
const skillConfig: Record<SkillType, {
  name: string;
  type: 'chat' | 'image';
  description: string;
  systemPrompt: string;
  imagePrompt?: string;
}> = {
  design: {
    name: skillCategoryNames.design,
    type: 'image',
    description: 'あなたのデザイン作品をアップロードしてください。色使い、構図、タイポグラフィなどを総合的に評価します。',
    systemPrompt: '',
    imagePrompt: `あなたはデザインの専門家です。アップロードされたデザイン画像を分析し、以下の観点から100点満点で採点してください：

1. 色彩センス（配色の調和、コントラスト）
2. レイアウト・構図（バランス、余白の使い方）
3. タイポグラフィ（フォント選び、可読性）
4. ビジュアルインパクト（目を引く要素、独自性）
5. 完成度（細部の丁寧さ、統一感）

最後に必ず以下の形式で点数を出力してください：
【造形力スコア】XX点

その後、改善点と良い点を具体的にフィードバックしてください。`
  },
  planning: {
    name: skillCategoryNames.planning,
    type: 'image',
    description: 'ワイヤーフレームや設計書、情報設計の資料をアップロードしてください。',
    systemPrompt: '',
    imagePrompt: `あなたはUI/UX設計の専門家です。アップロードされた設計資料（ワイヤーフレーム、情報設計図など）を分析し、以下の観点から100点満点で採点してください：

1. 情報設計（情報の優先順位、グルーピング）
2. ユーザビリティ（使いやすさ、導線設計）
3. 一貫性（デザインパターンの統一）
4. 網羅性（必要な要素の漏れがないか）
5. 実現可能性（実装のしやすさ）

最後に必ず以下の形式で点数を出力してください：
【設計力スコア】XX点

その後、改善点と良い点を具体的にフィードバックしてください。`
  },
  client: {
    name: skillCategoryNames.client,
    type: 'chat',
    description: 'コピーライティングに関する質問に答えて、あなたのCW力を診断します。',
    systemPrompt: `あなたはコピーライティングの専門家です。ユーザーのCW力（コピーライティング力）を診断するために、以下の流れで対話を行ってください。

【診断の流れ】
1. まず挨拶をして、CW力診断を始めることを伝える
2. 以下の3つの質問を順番に行う：
   - 質問1: 「あなたが書いた中で、最も反応が良かったキャッチコピーや文章を教えてください。なぜそれが効果的だったと思いますか？」
   - 質問2: 「新商品のLP（ランディングページ）を作る際、ヘッドラインを考える時に意識していることは何ですか？」
   - 質問3: 「クライアントから『もっとインパクトのある文章にして』と言われた時、どのようにアプローチしますか？」
3. 3つの質問への回答を総合的に評価し、100点満点でスコアを出す

【評価基準】
- ターゲット理解（誰に向けた文章か意識できているか）
- ベネフィット訴求（機能ではなく価値を伝えられるか）
- 具体性（抽象的でなく具体的に書けるか）
- 独自性（テンプレートに頼らない表現ができるか）
- 改善意識（フィードバックを活かせるか）

最後に必ず以下の形式で点数を出力してください：
【CW力スコア】XX点

その後、強みと改善点を具体的にフィードバックしてください。`,
  },
  business: {
    name: skillCategoryNames.business,
    type: 'chat',
    description: 'ビジネス・営業に関する質問に答えて、あなたのビジネス力を診断します。',
    systemPrompt: `あなたはフリーランスデザイナーのビジネスコンサルタントです。ユーザーのビジネス力を診断するために、以下の流れで対話を行ってください。

【診断の流れ】
1. まず挨拶をして、ビジネス力診断を始めることを伝える
2. 以下の3つの質問を順番に行う：
   - 質問1: 「新規クライアントを獲得するために、普段どのような営業活動をしていますか？具体的に教えてください。」
   - 質問2: 「案件の見積もりを出す際、どのような基準で価格を決めていますか？価格交渉をされた時はどう対応しますか？」
   - 質問3: 「リピート案件を増やすために意識していることはありますか？クライアントとの関係構築で工夫していることを教えてください。」
3. 3つの質問への回答を総合的に評価し、100点満点でスコアを出す

【評価基準】
- 営業力（新規開拓の行動量と質）
- 価格設定（適正な価値提供と価格のバランス）
- 交渉力（Win-Winの関係を作れるか）
- 関係構築（長期的な信頼関係を築けるか）
- 事業視点（フリーランスとして持続可能か）

最後に必ず以下の形式で点数を出力してください：
【ビジネス力スコア】XX点

その後、強みと改善点を具体的にフィードバックしてください。`,
  },
  mindset: {
    name: skillCategoryNames.mindset,
    type: 'chat',
    description: 'デザイナーとしての考え方や姿勢について質問します。',
    systemPrompt: `あなたはデザイナーのメンタルコーチです。ユーザーのマインド力（デザイナーとしての考え方・姿勢）を診断するために、以下の流れで対話を行ってください。

【診断の流れ】
1. まず挨拶をして、マインド力診断を始めることを伝える
2. 以下の3つの質問を順番に行う：
   - 質問1: 「デザインの仕事で壁にぶつかった時、どのように乗り越えますか？最近の具体的なエピソードがあれば教えてください。」
   - 質問2: 「自分のスキルアップのために、日頃どのような学習や情報収集をしていますか？」
   - 質問3: 「5年後、デザイナーとしてどうなっていたいですか？そのために今取り組んでいることはありますか？」
3. 3つの質問への回答を総合的に評価し、100点満点でスコアを出す

【評価基準】
- レジリエンス（困難を乗り越える力）
- 成長意欲（学び続ける姿勢）
- 目標設定（明確なビジョンを持っているか）
- 行動力（考えるだけでなく実行できるか）
- 自己理解（自分の強み弱みを把握しているか）

最後に必ず以下の形式で点数を出力してください：
【マインド力スコア】XX点

その後、強みと改善点を具体的にフィードバックしてください。`,
  },
};

export default function SkillDiagnosisDetail() {
  const { skillType } = useParams<{ skillType: SkillType }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diagnosisComplete, setDiagnosisComplete] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const config = skillType ? skillConfig[skillType] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI対話診断の初期メッセージ
  useEffect(() => {
    if (config?.type === 'chat' && messages.length === 0) {
      startChatDiagnosis();
    }
  }, [config]);

  const startChatDiagnosis = async () => {
    if (!config || !user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendMessageToDify(
        '診断を開始してください',
        '', // 新しい会話なので空文字列
        undefined, // onStream
        { name: user.email || 'ユーザー' }, // userContext
        config.systemPrompt, // systemPrompt
        'self_analysis' // mode
      );
      
      if (response.answer) {
        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: response.answer,
        }]);
      }
    } catch (err) {
      console.error('診断開始エラー:', err);
      setError('診断の開始に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !config || !user || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await sendMessageToDify(
        input,
        '', // 新しい会話なので空文字列
        undefined, // onStream
        { name: user.email || 'ユーザー' }, // userContext
        config.systemPrompt, // systemPrompt
        'self_analysis' // mode
      );
      
      if (response.answer) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // スコアを抽出
        const scoreMatch = response.answer.match(/【.*スコア】(\d+)点/);
        if (scoreMatch) {
          const extractedScore = parseInt(scoreMatch[1], 10);
          setScore(extractedScore);
          setDiagnosisComplete(true);
          await saveScore(extractedScore);
        }
      }
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError('メッセージの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDiagnosis = async () => {
    if (!selectedImage || !config || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 画像をBase64に変換
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Difyに画像分析をリクエスト
          // Note: Difyの画像分析機能を使用（Vision対応モデルが必要）
          const response = await sendMessageToDify(
            `${config.imagePrompt}\n\n[画像がアップロードされました]`,
            '', // 新しい会話なので空文字列
            undefined, // onStream
            { 
              name: user.email || 'ユーザー',
            }, // userContext
            config.imagePrompt || '', // systemPrompt
            'self_analysis' // mode
          );
          
          if (response.answer) {
            setMessages([{
              id: Date.now().toString(),
              role: 'assistant',
              content: response.answer,
            }]);
            
            // スコアを抽出
            const scoreMatch = response.answer.match(/【.*スコア】(\d+)点/);
            if (scoreMatch) {
              const extractedScore = parseInt(scoreMatch[1], 10);
              setScore(extractedScore);
              setDiagnosisComplete(true);
              await saveScore(extractedScore);
            }
          }
        } catch (err) {
          console.error('画像分析エラー:', err);
          setError('画像の分析に失敗しました。もう一度お試しください。');
        }
        
        setIsLoading(false);
      };
      reader.readAsDataURL(selectedImage);
    } catch (err) {
      console.error('画像読み込みエラー:', err);
      setError('画像の読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  const saveScore = async (newScore: number) => {
    if (!user || !skillType) return;
    
    try {
      // 既存のスキル診断データを取得
      const { data: existing } = await supabase
        .from('skill_diagnosis')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const skillColumn = `${skillType}_skill`;
      const updateData: Record<string, unknown> = {
        user_id: user.id,
        [skillColumn]: newScore,
        updated_at: new Date().toISOString(),
      };
      
      // 既存データがあれば他のスキルも保持
      if (existing) {
        updateData.design_skill = skillType === 'design' ? newScore : existing.design_skill;
        updateData.planning_skill = skillType === 'planning' ? newScore : existing.planning_skill;
        updateData.client_skill = skillType === 'client' ? newScore : existing.client_skill;
        updateData.business_skill = skillType === 'business' ? newScore : existing.business_skill;
        updateData.mindset_skill = skillType === 'mindset' ? newScore : existing.mindset_skill;
        updateData.designer_type = existing.designer_type;
      }
      
      await supabase
        .from('skill_diagnosis')
        .upsert(updateData, { onConflict: 'user_id' });
        
    } catch (err) {
      console.error('スコアの保存に失敗:', err);
    }
  };

  if (!config || !skillType) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">無効なスキルタイプです</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <div>
          <h1 className="font-bold text-slate-900">{config.name}診断</h1>
          <p className="text-xs text-slate-500">
            {config.type === 'chat' ? 'AI対話形式' : '画像アップロード形式'}
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          
          {/* 説明 */}
          {messages.length === 0 && !imagePreview && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-4">
              <p className="text-slate-600">{config.description}</p>
            </div>
          )}
          
          {/* 画像アップロード（image type） */}
          {config.type === 'image' && !diagnosisComplete && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-4">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="アップロード画像"
                    className="w-full rounded-xl"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="flex-1 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition"
                    >
                      画像を変更
                    </button>
                    <button
                      onClick={handleImageDiagnosis}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          分析中...
                        </>
                      ) : (
                        '診断を開始'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-12 border-2 border-dashed border-slate-300 rounded-xl hover:border-red-400 hover:bg-red-50 transition flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Image size={32} className="text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-700">画像をアップロード</p>
                    <p className="text-sm text-slate-500 mt-1">クリックして選択</p>
                  </div>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          )}
          
          {/* メッセージ一覧 */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {/* ローディング */}
          {isLoading && config.type === 'chat' && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {/* 診断完了 */}
          {diagnosisComplete && score !== null && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={24} className="text-green-600" />
                <h3 className="font-bold text-green-800">診断完了！</h3>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-green-700 mb-2">{config.name}</p>
                <p className="text-5xl font-black text-green-600">{score}<span className="text-2xl">点</span></p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
              >
                ホームに戻る
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア（chat type & 診断未完了時のみ） */}
      {config.type === 'chat' && !diagnosisComplete && (
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

