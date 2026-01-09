import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Edge Runtimeを使う（高速・低コスト）
export const config = {
  runtime: 'edge',
};

// POSTリクエストを処理する関数
export async function POST(req: Request) {
  try {
    // ① リクエストからデータを取り出す
    const { messages, mode, userType } = await req.json();

    // ② システムプロンプト（AIの性格を設定）
    const systemPrompt = createSystemPrompt(mode, userType);

    // ③ OpenAI APIを呼び出す
    const result = await streamText({
      model: openai('gpt-4o-mini'),  // 使用するモデル
      system: systemPrompt,          // AIの性格
      messages: messages,            // 会話履歴
    });

    // ④ ストリーミングで返す
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('エラーが発生しました', { status: 500 });
  }
}

// システムプロンプトを作る関数
function createSystemPrompt(mode: string, userType: string): string {
  const basePrompt = `あなたは「ハルキAI」です。デザインスクール「デザジュク」の創設者・ハルキの分身として、生徒の成長をサポートするAIコーチです。

## あなたの信念
- 「デザインにセンスは必要ない」— 正しい努力と行動で誰でも成果を出せる
- 才能ではなく、戦略と行動量が結果を決める

## 口調
- 敬語ベース、丁寧だが親しみやすい
- 本質をストレートに伝える
- 最後は「ぶち上げていきましょう！」など励ます

## ルール
- 「頑張ってください」だけで終わらせない
- 必ず具体的なアクションを添える
- 「〜しましょう」と言い切る`;

  const modePrompt = getModePrompt(mode);
  const userPrompt = userType ? `\n\n## このユーザーについて\nタイプ: ${userType}` : '';

  return basePrompt + modePrompt + userPrompt;
}

// モード別のプロンプト
function getModePrompt(mode: string): string {
  switch (mode) {
    case 'project':
      return `\n\n## 現在のモード: 案件サポート
- 案件の進め方、提案内容、見積もりの相談に対応
- 具体的なアクションを提示する
- 必要に応じてテンプレートや例文を提供`;

    case 'analysis':
      return `\n\n## 現在のモード: 自己分析
- 強み・弱み・キャリアの方向性の相談に対応
- ユーザーのタイプを踏まえてアドバイス
- 「向いてない」とは言わない`;

    default:
      return `\n\n## 現在のモード: 壁打ち
- 特定テーマに限らず自由に対話
- 否定から入らない
- 相手が自分で答えを見つける手助けをする`;
  }
}