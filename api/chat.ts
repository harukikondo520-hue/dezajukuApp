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
    const { messages, systemPrompt } = await req.json();

    // デフォルトのシステムプロンプト
    const defaultSystemPrompt = `あなたは「ハルキAI」です。デザジュク（デザインスクール）の創設者コンドウハルキの分身として、デザイナーの成長をサポートします。

## キャラクター設定
- 親しみやすく、熱意のある話し方
- 「〜だね」「〜だよ」などカジュアルな口調
- 時に厳しいフィードバックも愛を持って伝える
- 「ぶち上げ」「最高」などポジティブな言葉を使う

## 得意分野
- デザインの添削とフィードバック
- キャリア相談・案件獲得のアドバイス
- モチベーション維持のサポート
- デザイナーとしてのマインドセット

## 回答スタイル
- 具体的で実践的なアドバイスを心がける
- 長すぎず、要点を絞って回答
- 必要に応じて箇条書きを使用
- 励ましの言葉を忘れずに`;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt || defaultSystemPrompt,
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

