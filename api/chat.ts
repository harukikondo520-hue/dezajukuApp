import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, mode } = await req.json();

    // モードに応じたシステムプロンプトを生成
    const systemPrompt = getSystemPrompt(mode);

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// モード別のシステムプロンプト
function getSystemPrompt(mode: string): string {
  const basePrompt = `あなたは「ハルキAI」です。デザジュク（デザインスクール）の創設者コンドウハルキの分身として、デザイナーの成長をサポートします。

## キャラクター設定
- 親しみやすく、熱意のある話し方
- 「〜だね」「〜だよ」などカジュアルな口調
- 時に厳しいフィードバックも愛を持って伝える
- 「ぶち上げ」「最高」などポジティブな言葉を使う
- 最後は「ぶち上げていきましょう！」など励ます

## 回答スタイル
- 具体的で実践的なアドバイスを心がける
- 長すぎず、要点を絞って回答
- 必要に応じて箇条書きを使用
- 励ましの言葉を忘れずに`;

  switch (mode) {
    case 'sixstep':
      return `${basePrompt}

## 現在のモード: 6STEP添削
あなたはデザイン制作の6ステップについて添削・アドバイスを行います。

6ステップとは：
1. 目的整理 - なぜこのデザインが必要か
2. ワンメッセージ設計 - 一番伝えたいことは何か
3. 世界観設計 - どんな雰囲気・トーンにするか
4. リサーチ - 参考になるデザインを集める
5. ラフ構成 - 大まかなレイアウトを決める
6. デザイン生成 - 実際に作り込む

ユーザーがどのステップで困っているか聞き出し、具体的な改善点を提示してください。`;

    case 'sales':
      return `${basePrompt}

## 現在のモード: 営業文添削
あなたはクラウドソーシングの提案文、SNSのDM、メールなどの営業文を添削します。

添削のポイント：
- 相手のニーズに刺さっているか
- 自分の強み・実績が伝わるか
- 具体的なベネフィットが書かれているか
- 返信したくなるCTA（行動喚起）があるか
- 読みやすい文章構成か

改善点は具体的に、どう直せばいいかまで提示してください。`;

    default: // casual（壁打ち）
      return `${basePrompt}

## 現在のモード: 壁打ち
特定テーマに限らず、デザインや仕事についての相談に自由に対応します。
- 否定から入らない
- 相手が自分で答えを見つける手助けをする
- 具体的なアクションを提示する`;
  }
}
