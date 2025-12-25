# Vercelデプロイガイド

このガイドでは、デザジュクアプリをVercelにデプロイする手順を説明します。

## 📋 事前準備

### 必要なもの
- GitHubアカウント
- Vercelアカウント（GitHubで無料登録可能）
- Supabaseプロジェクト（既に設定済み）
- Dify APIキー（オプション、AIチャット機能を使う場合）

### 必要な環境変数を確認
`.env`ファイルから以下の値をメモしておきます：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DIFY_API_KEY=app-xxxxxxxxxxxx（任意）
VITE_DIFY_API_URL=https://api.dify.ai/v1（任意）
```

---

## 🚀 デプロイ手順

### ステップ1: GitHubにプッシュ

```bash
# 1. Gitの初期化（まだの場合）
git init

# 2. すべてのファイルをステージング
git add .

# 3. コミット
git commit -m "Initial commit"

# 4. GitHubリポジトリの作成
# → GitHubウェブサイトで新しいリポジトリを作成

# 5. リモートリポジトリを追加してプッシュ
git remote add origin https://github.com/あなたのユーザー名/dezajuku.git
git branch -M main
git push -u origin main
```

### ステップ2: Vercelでプロジェクトをインポート

1. **Vercelにログイン**
   - https://vercel.com にアクセス
   - 「Continue with GitHub」でサインイン

2. **新しいプロジェクトを作成**
   - ダッシュボードで「Add New...」→「Project」をクリック
   - GitHubリポジトリ一覧から「dezajuku」を選択
   - 「Import」をクリック

3. **プロジェクト設定**
   
   以下の設定が自動的に検出されます：
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
   → そのままでOKです！

### ステップ3: 環境変数の設定

**重要**: デプロイ前に環境変数を設定します。

1. 「Environment Variables」セクションまでスクロール

2. 以下の環境変数を1つずつ追加：

   | Name | Value | 環境 |
   |------|-------|------|
   | `VITE_SUPABASE_URL` | あなたのSupabase URL | All |
   | `VITE_SUPABASE_ANON_KEY` | あなたのSupabase Anon Key | All |
   | `VITE_DIFY_API_KEY` | あなたのDify API Key | All |
   | `VITE_DIFY_API_URL` | `https://api.dify.ai/v1` | All |

   **追加方法**:
   - 「Name」に変数名を入力
   - 「Value」に値を入力
   - 「Production」「Preview」「Development」すべてにチェック
   - 「Add」をクリック

3. すべての環境変数を追加したら、「Deploy」をクリック

### ステップ4: デプロイ完了を待つ

- ビルドログがリアルタイムで表示されます
- 通常2〜3分で完了します
- ✅ **「Congratulations!」**が表示されたら成功です

### ステップ5: デプロイされたアプリを確認

1. 表示されたURLをクリック（例: `https://dezajuku-xxx.vercel.app`）
2. アプリが正常に動作するか確認：
   - ログイン・サインアップ
   - 診断機能
   - AIチャット（Dify設定している場合）

---

## 🔧 デプロイ後の設定

### Supabaseの設定更新

デプロイしたURLをSupabaseの許可リストに追加します：

1. **Supabaseダッシュボード**を開く
2. プロジェクト設定 > **Authentication** > **URL Configuration**
3. 「Site URL」にVercelのURL追加:
   ```
   https://dezajuku-xxx.vercel.app
   ```
4. 「Redirect URLs」にも追加:
   ```
   https://dezajuku-xxx.vercel.app/**
   ```

### カスタムドメインの設定（オプション）

独自ドメインを使いたい場合：

1. Vercel プロジェクト > **Settings** > **Domains**
2. 「Add Domain」をクリック
3. ドメイン名を入力（例: `dezajuku.com`）
4. 表示されるDNSレコードをドメインレジストラで設定
5. 数分〜数時間で反映されます

---

## 🔄 更新のデプロイ

コードを変更した場合、GitHubにプッシュするだけで自動的にデプロイされます：

```bash
# 1. 変更をコミット
git add .
git commit -m "機能追加: xxx"

# 2. GitHubにプッシュ
git push

# → Vercelが自動的に検知して再デプロイされます
```

---

## 🐛 トラブルシューティング

### ビルドエラーが出る

**原因**: TypeScriptのエラーや依存関係の問題

**解決方法**:
```bash
# ローカルでビルドして確認
npm run build

# エラーを修正してコミット
git add .
git commit -m "Fix build errors"
git push
```

### 環境変数が反映されない

**原因**: 環境変数の設定後に再デプロイしていない

**解決方法**:
1. Vercel ダッシュボード > プロジェクト > **Deployments**
2. 最新のデプロイの「・・・」メニュー > **Redeploy**
3. 「Redeploy」をクリック

### ページ遷移で404エラー

**原因**: `vercel.json`が正しく設定されていない

**解決方法**:
- `vercel.json`がプロジェクトルートにあるか確認
- 内容が正しいか確認
- 再デプロイ

### ログイン・サインアップができない

**原因**: SupabaseのURL設定

**解決方法**:
- SupabaseのURL Configurationを確認
- Vercelのデプロイ URLが登録されているか確認

---

## 📊 パフォーマンス最適化（オプション）

### 画像の最適化

大きな画像ファイルがある場合、WebPに変換することを推奨：

```bash
# インストール
npm install --save-dev vite-plugin-image-optimizer

# vite.config.ts に追加
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
```

### Analyticsの追加

Vercel Analyticsで訪問者数を確認：

1. Vercel プロジェクト > **Analytics** タブ
2. 「Enable Analytics」をクリック

---

## ✅ チェックリスト

デプロイ前に確認：

- [ ] `.env`ファイルがGitHubにプッシュされていない
- [ ] すべての環境変数をVercelに設定した
- [ ] ローカルで`npm run build`が成功する
- [ ] `vercel.json`がプロジェクトルートにある

デプロイ後に確認：

- [ ] デプロイされたURLでアプリが開く
- [ ] ログイン・サインアップが動作する
- [ ] Supabaseとの接続が正常
- [ ] AIチャットが動作する（Dify設定している場合）
- [ ] SupabaseのURL設定を更新した

---

## 🎉 完了！

おめでとうございます！デザジュクアプリが本番環境にデプロイされました。

**次のステップ:**
- ユーザーにURLを共有
- フィードバックを収集
- 継続的に改善・機能追加

