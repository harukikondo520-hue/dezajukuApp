# デザジュク

デザイナーのためのオンライン学習プラットフォーム

## 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Dify AI チャット設定（AIタブ用）
VITE_DIFY_API_KEY=your_dify_api_key_here
VITE_DIFY_API_URL=https://api.dify.ai/v1
```

### Dify AI連携の設定方法

1. **Difyアカウントの作成**
   - [Dify](https://dify.ai)にアクセスしてアカウントを作成

2. **アプリの作成**
   - Difyダッシュボードで新しいチャットアプリを作成
   - **プロンプトの設定例**:
   ```
   あなたはデザジュクの創設者、ハルキです。デザイナーの学習と案件獲得を全力でサポートします。

   # ユーザー情報
   - 名前: {{user_name}}
   - デザイナータイプ: {{designer_type}}
   - タイプ説明: {{designer_type_description}}
   - 造形力: {{design_skill}}点
   - 設計力: {{planning_skill}}点
   - CW力: {{client_skill}}点
   - ビジネス力: {{business_skill}}点
   - マインド力: {{mindset_skill}}点
   - 平均スキル: {{average_skill}}点

   ユーザーの診断結果とスキルレベルに基づいて、最適なアドバイスを提供してください。
   ```

3. **変数の設定**
   - Difyのプロンプト画面で、以下の変数を追加:
     - `user_name` (テキスト)
     - `designer_type` (テキスト)
     - `designer_type_description` (テキスト)
     - `design_skill` (数値)
     - `planning_skill` (数値)
     - `client_skill` (数値)
     - `business_skill` (数値)
     - `mindset_skill` (数値)
     - `average_skill` (数値)

4. **APIキーの取得**
   - アプリ設定 > APIアクセス > APIキー
   - 新しいAPIキーを生成してコピー

5. **環境変数の設定**
   - `.env`ファイルに`VITE_DIFY_API_KEY`と`VITE_DIFY_API_URL`を設定
   - セルフホストの場合は`VITE_DIFY_API_URL`を適切なURLに変更

6. **開発サーバーの再起動**
   - `npm run dev`を再実行して環境変数を読み込む

### パーソナライズされたAI

AIチャットでは、以下のユーザー情報が自動的にDifyに送信されます：
- ユーザー名
- デザイナータイプ診断の結果（アーティスト型、ストラテジスト型など）
- スキル診断の結果（5つのスキル領域のスコア）

これにより、各ユーザーの状況に合わせた最適なアドバイスを提供できます。

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## Vercelへのデプロイ

### 準備

1. **GitHubリポジトリの作成**
   ```bash
   # Gitの初期化（まだの場合）
   git init
   
   # .gitignoreの確認（.env、node_modules等が含まれているか）
   
   # コミット
   git add .
   git commit -m "Initial commit"
   
   # GitHubにプッシュ
   git remote add origin https://github.com/your-username/dezajuku.git
   git branch -M main
   git push -u origin main
   ```

### Vercelでのデプロイ手順

1. **Vercelアカウントの作成**
   - [Vercel](https://vercel.com)にアクセス
   - GitHubアカウントでサインアップ

2. **新しいプロジェクトをインポート**
   - Vercelダッシュボードで「Add New」→「Project」をクリック
   - GitHubリポジトリを選択
   - 「dezajuku」リポジトリをインポート

3. **プロジェクト設定**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (デフォルト)
   - **Build Command**: `npm run build` (自動設定)
   - **Output Directory**: `dist` (自動設定)

4. **環境変数の設定**
   
   「Environment Variables」セクションで以下を追加：
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | あなたのSupabase URL |
   | `VITE_SUPABASE_ANON_KEY` | あなたのSupabase Anon Key |
   | `VITE_DIFY_API_KEY` | あなたのDify API Key（任意） |
   | `VITE_DIFY_API_URL` | `https://api.dify.ai/v1`（任意） |
   
   ⚠️ **重要**: 
   - すべての環境変数は「Production」「Preview」「Development」の3つの環境すべてにチェックを入れる
   - `VITE_`プレフィックスが必須です

5. **デプロイ**
   - 「Deploy」ボタンをクリック
   - ビルドが完了すると、自動的にデプロイされます
   - 数分後、デプロイ完了のURLが表示されます

### デプロイ後の確認

1. **URLにアクセス**
   - `https://your-project.vercel.app` のような URL が発行されます

2. **動作確認**
   - ログイン・サインアップが正常に動作するか
   - Supabaseとの接続が正常か
   - 診断機能が動作するか
   - AI チャット（Dify連携している場合）が動作するか

### カスタムドメインの設定（オプション）

1. Vercelダッシュボード > プロジェクト > Settings > Domains
2. 「Add Domain」から独自ドメインを追加
3. DNSレコードを設定（Vercelが指示を表示します）

### 自動デプロイ

- `main`ブランチへのpushで自動的に本番環境にデプロイ
- プルリクエストごとにプレビュー環境が自動生成
- コミットごとにビルド・デプロイ状況を確認可能

### トラブルシューティング

**ビルドエラーが出る場合:**
```bash
# ローカルでビルドを確認
npm run build

# エラーがあれば修正してコミット
git add .
git commit -m "Fix build errors"
git push
```

**環境変数が反映されない場合:**
- Vercelダッシュボードで環境変数を再確認
- 環境変数追加後は「Redeploy」が必要
- `VITE_`プレフィックスがあるか確認

**ルーティングが動作しない場合:**
- `vercel.json`が正しく配置されているか確認
- SPAのリライトルールが設定されているか確認
