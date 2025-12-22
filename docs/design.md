# Dezajuku アプリケーション 設計書

## 1. アーキテクチャ概要

### 1.1 システム構成

```
┌─────────────────────────────────────────────┐
│          ユーザーインターフェース              │
│    (React + TypeScript + Tailwind CSS)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         アプリケーション層                    │
│  - ページコンポーネント                       │
│  - ビジネスロジック                          │
│  - 状態管理 (React Hooks)                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           データアクセス層                    │
│  - Supabase Client                          │
│  - API呼び出し                               │
│  - キャッシング                              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Supabase Backend                  │
│  - PostgreSQL Database                      │
│  - Authentication (Auth)                    │
│  - Row Level Security (RLS)                 │
└─────────────────────────────────────────────┘
```

### 1.2 技術選定理由

| 技術 | 理由 |
|------|------|
| React | コンポーネントベースの設計、豊富なエコシステム |
| TypeScript | 型安全性、開発効率の向上 |
| Tailwind CSS | 高速なUI開発、一貫したデザインシステム |
| Supabase | フルマネージドBaaS、RLS、リアルタイム機能 |
| Vite | 高速なビルド、優れた開発体験 |
| Recharts | React専用のグラフライブラリ、柔軟なカスタマイズ |

---

## 2. ディレクトリ構成

```
src/
├── components/          # 共通コンポーネント
│   ├── Layout.tsx      # レイアウト（ナビゲーション含む）
│   └── Opening.tsx     # オープニング画面
├── contexts/           # React Context
│   └── AuthContext.tsx # 認証コンテキスト
├── data/              # 静的データ
│   └── questions.ts   # 診断質問データ
├── hooks/             # カスタムフック
│   └── useBadges.ts   # バッジ取得フック
├── lib/               # ユーティリティ
│   ├── supabase.ts    # Supabaseクライアント
│   └── diagnosisCalculator.ts # 診断ロジック
├── pages/             # ページコンポーネント
│   ├── Login.tsx
│   ├── SignUp.tsx
│   ├── Onboarding.tsx
│   ├── DiagnosisPage.tsx
│   ├── DiagnosisResultPage.tsx
│   ├── Home.tsx
│   ├── AIChat.tsx
│   ├── Profile.tsx
│   ├── VideoLectures.tsx (未使用)
│   ├── Learning.tsx (未使用)
│   ├── Announcements.tsx (未使用)
│   └── Survey.tsx (未使用)
├── types/             # 型定義
│   ├── database.ts    # データベース型
│   └── diagnosis.ts   # 診断関連型
├── App.tsx            # ルーティング設定
├── main.tsx           # エントリーポイント
└── index.css          # グローバルスタイル
```

---

## 3. データフロー

### 3.1 認証フロー

```
[ユーザー]
    │
    ├─ ログイン入力
    │     │
    │     ▼
    │  [Login.tsx] → supabase.auth.signInWithPassword()
    │     │
    │     ▼
    │  [AuthContext] セッション確立
    │     │
    │     ▼
    │  プロフィール取得
    │     │
    │     ├─ onboarding_completed = false → /onboarding
    │     └─ onboarding_completed = true → /
    │
    └─ サインアップ入力
          │
          ▼
       [SignUp.tsx] → supabase.auth.signUp()
          │
          ▼
       ユーザーレコード作成（トリガー）
          │
          ▼
       /onboarding へリダイレクト
```

### 3.2 オンボーディングフロー

```
[オンボーディング開始]
    │
    ▼
[ロードマップ選択]
    │
    ├─ 案件獲得コース選択
    │   │
    │   ▼
    │  roadmap_id を保存
    │
    └─ 収入アップコース選択
        │
        ▼
       roadmap_id を保存
    │
    ▼
[スキル診断] (/onboarding/diagnosis)
    │
    ├─ 20問に回答
    │   │
    │   ▼
    │  スコア計算
    │   │
    │   ▼
    │  デザイナータイプ判定
    │
    ▼
[診断結果] (/onboarding/result)
    │
    ├─ 結果表示
    │   │
    │   ▼
    │  onboarding_completed = true
    │
    ▼
[ホーム画面]
```

### 3.3 データ取得フロー（ホーム画面）

```
[Home.tsx マウント]
    │
    ▼
[loadAllData() 並列実行]
    │
    ├─ loadProjects() → 今月の案件取得
    │
    ├─ loadAllProjects() → 全案件取得
    │
    ├─ loadMonthlyIncome() → 直近6ヶ月の収益集計
    │
    ├─ loadTasks() → ロードマップタスク取得
    │
    └─ loadVideoProgress() → 動画進捗取得
    │
    ▼
[state更新]
    │
    ▼
[UI描画]
```

---

## 4. 状態管理

### 4.1 グローバル状態（AuthContext）

```typescript
interface AuthContextType {
  user: User | null;              // Supabaseユーザー
  profile: UserProfile | null;    // ユーザープロフィール
  loading: boolean;               // ロード状態
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**管理対象**:
- 認証状態
- ユーザープロフィール
- セッション管理

**更新タイミング**:
- アプリ起動時（セッション復元）
- ログイン/サインアップ成功時
- ログアウト時
- プロフィール更新時

### 4.2 ローカル状態

各ページコンポーネントで管理:

#### Home.tsx
```typescript
- projects: Project[]          // 今月の案件
- allProjects: Project[]       // 全案件
- monthlyIncomeData: MonthlyData[] // 月別収益
- tasks: Task[]                // ロードマップタスク
- userTasks: UserTask[]        // ユーザータスク進捗
- videoProgress: { completed, total } // 動画進捗
- showModal: boolean           // モーダル表示
- editingProject: Project | null // 編集中案件
- formData: { name, reward, status } // フォーム入力
```

#### Profile.tsx
```typescript
- diagnosis: DiagnosisResult | null // 診断結果
- unreadCount: number          // 未読お知らせ数
- isEditingName: boolean       // 名前編集中フラグ
- editedName: string           // 編集中の名前
- currentBannerIndex: number   // バナー表示位置
- badges: Badge[]              // バッジ一覧
```

#### DiagnosisPage.tsx
```typescript
- currentQuestion: number      // 現在の質問番号
- answers: Record<number, number> // 回答データ
- isSubmitting: boolean        // 送信中フラグ
```

---

## 5. コンポーネント設計

### 5.1 ページコンポーネント

#### Home.tsx
**責務**: ダッシュボードの表示と案件管理

**主要機能**:
- 月収推移グラフ表示
- 収益統計カード表示
- カリキュラム進捗表示
- ロードマップタスク管理
- 案件CRUD操作

**データフロー**:
```
useAuth() → user, profile
  │
  ▼
useEffect() → loadAllData()
  │
  ▼
Promise.all([
  loadProjects(),
  loadAllProjects(),
  loadMonthlyIncome(),
  loadTasks(),
  loadVideoProgress()
])
  │
  ▼
setState() → 再レンダリング
```

#### Profile.tsx
**責務**: プロフィール情報とデザイナータイプの表示

**主要機能**:
- ユーザー名編集
- デザイナータイプ表示
- スキルレーダーチャート表示
- バナーカルーセル
- バッジ一覧表示

**データフロー**:
```
useAuth() → user, profile
  │
  ▼
useEffect() → loadData()
  │
  ▼
Promise.all([
  loadDiagnosis(),
  loadUnreadCount()
])
  │
  ▼
useBadges() → バッジ取得
  │
  ▼
setState() → 再レンダリング
```

#### DiagnosisPage.tsx
**責務**: スキル診断の実施

**主要機能**:
- 20問の質問表示
- 5段階評価入力
- プログレスバー表示
- 前へ/次へナビゲーション
- 診断結果計算と保存

**データフロー**:
```
diagnosisQuestions → 質問データ
  │
  ▼
useState() → answers
  │
  ▼
handleAnswer() → 回答記録
  │
  ▼
handleComplete() → calculateDiagnosisResult()
  │
  ▼
supabase.from('skill_diagnosis').upsert()
  │
  ▼
navigate('/diagnosis/result')
```

### 5.2 共通コンポーネント

#### Layout.tsx
**責務**: ページレイアウトとナビゲーション

**構成**:
- ボトムナビゲーション（モバイル）
- フローティングナビゲーション（デスクトップ）
- メインコンテンツエリア

**ナビゲーション項目**:
```typescript
[
  { path: '/', label: 'ホーム', icon: Home },
  { path: '/chat', label: 'AIチャット', icon: MessageCircle },
  { path: '/profile', label: 'プロフィール', icon: User }
]
```

#### Opening.tsx
**責務**: オープニングアニメーション表示

**機能**:
- 3秒のロゴ動画再生
- sessionStorageによる1回のみ表示制御
- 動画読み込みエラー時の自動スキップ

---

## 6. ルーティング設計

### 6.1 ルート保護

#### PublicRoute
- 未認証ユーザーのみアクセス可能
- 認証済みユーザーは `/` へリダイレクト
- 対象: `/login`, `/signup`

#### OnboardingRoute
- 認証済みかつオンボーディング未完了ユーザーのみアクセス可能
- オンボーディング完了済みユーザーは `/` へリダイレクト
- 対象: `/onboarding`, `/onboarding/diagnosis`, `/onboarding/result`

#### AuthenticatedRoute
- 認証済みユーザーのみアクセス可能
- 未認証ユーザーは `/login` へリダイレクト
- 対象: `/diagnosis`, `/diagnosis/result`

#### PrivateRoute
- 認証済みかつオンボーディング完了ユーザーのみアクセス可能
- 未認証ユーザーは `/login` へリダイレクト
- オンボーディング未完了ユーザーは `/onboarding` へリダイレクト
- 対象: `/`, `/chat`, `/profile`, `/videos`

### 6.2 ルート一覧

```
/ (PrivateRoute)
  └─ Home.tsx

/login (PublicRoute)
  └─ Login.tsx

/signup (PublicRoute)
  └─ SignUp.tsx

/onboarding (OnboardingRoute)
  └─ Onboarding.tsx

/onboarding/diagnosis (OnboardingRoute)
  └─ DiagnosisPage.tsx

/onboarding/result (OnboardingRoute)
  └─ DiagnosisResultPage.tsx

/chat (PrivateRoute)
  └─ AIChat.tsx

/profile (PrivateRoute)
  └─ Profile.tsx

/diagnosis (AuthenticatedRoute)
  └─ DiagnosisPage.tsx

/diagnosis/result (AuthenticatedRoute)
  └─ DiagnosisResultPage.tsx
```

---

## 7. データベース設計詳細

### 7.1 リレーション図

```
auth.users
    │
    ├─1:1─ users (profile)
    │         │
    │         ├─1:N─ projects
    │         ├─1:N─ user_tasks
    │         ├─1:N─ video_progress
    │         ├─1:N─ user_badges
    │         └─1:1─ skill_diagnosis
    │
    └─N:1─ roadmaps
              │
              └─1:N─ tasks
                      │
                      └─N:1─ videos
                              │
                              └─N:1─ categories
```

### 7.2 インデックス戦略

#### パフォーマンス最適化のためのインデックス

```sql
-- users
CREATE INDEX idx_users_roadmap_id ON users(roadmap_id);

-- projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_status ON projects(status);

-- skill_diagnosis
CREATE INDEX idx_skill_diagnosis_user_id ON skill_diagnosis(user_id);

-- tasks
CREATE INDEX idx_tasks_roadmap_id ON tasks(roadmap_id);
CREATE INDEX idx_tasks_order_index ON tasks(order_index);

-- user_tasks
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX idx_user_tasks_completed ON user_tasks(completed);

-- video_progress
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_completed ON video_progress(completed);
```

### 7.3 Row Level Security ポリシー

#### 基本原則
- 全テーブルでRLS有効化
- ユーザーは自分のデータのみアクセス可能
- `auth.uid()` でオーナーシップ検証
- SELECT / INSERT / UPDATE / DELETE を個別に定義

#### 例: projects テーブル

```sql
-- SELECT: 自分の案件のみ閲覧可能
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: 自分の案件のみ作成可能
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分の案件のみ更新可能
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 自分の案件のみ削除可能
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

---

## 8. スキル診断ロジック

### 8.1 質問構成

| カテゴリ | 質問数 | 質問ID |
|---------|--------|--------|
| 造形力 (design) | 4 | 1-4 |
| 設計力 (planning) | 4 | 5-8 |
| CW力 (client) | 4 | 9-12 |
| ビジネス力 (business) | 4 | 13-16 |
| マインド力 (mindset) | 4 | 17-20 |

### 8.2 スコア計算

```typescript
// 各カテゴリのスコア = (回答の合計 / 最大値) × 100
// 最大値 = 質問数 × 5段階評価の最大値(5) = 4 × 5 = 20

例:
造形力の回答: [5, 4, 5, 4] = 合計18
造形力スコア = (18 / 20) × 100 = 90点
```

### 8.3 デザイナータイプ判定

```typescript
// 1. 各カテゴリのスコアを計算
const scores = {
  design: calculateCategoryScore('design'),
  planning: calculateCategoryScore('planning'),
  client: calculateCategoryScore('client'),
  business: calculateCategoryScore('business'),
  mindset: calculateCategoryScore('mindset')
};

// 2. 最高スコアのカテゴリを特定
const maxScore = Math.max(...Object.values(scores));
const maxCategory = Object.keys(scores).find(
  key => scores[key] === maxScore
);

// 3. バランス型判定（全スコアが60-80点の範囲内）
const isBalanced = Object.values(scores).every(
  score => score >= 60 && score <= 80
);

// 4. タイプ決定
if (isBalanced) {
  return 'all_rounder';
} else {
  switch (maxCategory) {
    case 'design': return 'artist';
    case 'planning': return 'strategist';
    case 'client': return 'partner';
    case 'business': return 'business_designer';
    case 'mindset': return 'growth';
  }
}
```

### 8.4 デザイナータイプ定義

| タイプ | 英語名 | 特徴 | カラー |
|--------|--------|------|--------|
| アーティスト型 | artist | 造形力に優れる | #ef4444（赤） |
| ストラテジスト型 | strategist | 設計力に優れる | #3b82f6（青） |
| パートナー型 | partner | CW力に優れる | #22c55e（緑） |
| ビジネスデザイナー型 | business_designer | ビジネス力に優れる | #f59e0b（オレンジ） |
| グロース型 | growth | マインド力に優れる | #8b5cf6（紫） |
| オールラウンダー型 | all_rounder | バランス型 | #6b7280（グレー） |

---

## 9. APIクライアント設計

### 9.1 Supabaseクライアント初期化

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
```

### 9.2 クエリパターン

#### 単一レコード取得（0または1件）
```typescript
const { data, error } = await supabase
  .from('skill_diagnosis')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();  // エラーを投げない
```

#### 複数レコード取得
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

#### レコード作成
```typescript
const { error } = await supabase
  .from('projects')
  .insert({
    user_id: userId,
    name: '案件名',
    reward: 100000,
    status: 'in_progress'
  });
```

#### レコード更新
```typescript
const { error } = await supabase
  .from('projects')
  .update({ status: 'completed' })
  .eq('id', projectId);
```

#### レコード削除
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

#### Upsert（存在すれば更新、なければ作成）
```typescript
const { error } = await supabase
  .from('skill_diagnosis')
  .upsert({
    user_id: userId,
    design_skill: 85,
    // ...
  });
```

---

## 10. エラーハンドリング

### 10.1 認証エラー

```typescript
try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (error) {
  if (error.message.includes('Invalid login credentials')) {
    setError('メールアドレスまたはパスワードが正しくありません');
  } else {
    setError('ログインに失敗しました');
  }
}
```

### 10.2 データベースエラー

```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*');

if (error) {
  console.error('Error loading projects:', error);
  // ユーザーにエラーメッセージを表示
  return;
}
```

### 10.3 グローバルエラーバウンダリ

将来的な実装検討事項:
- Reactエラーバウンダリの追加
- エラーログサービスとの連携
- ユーザーフレンドリーなエラー画面

---

## 11. パフォーマンス最適化

### 11.1 データ取得の最適化

#### 並列クエリ実行
```typescript
// ❌ 直列実行（遅い）
const projects = await loadProjects();
const income = await loadMonthlyIncome();
const tasks = await loadTasks();

// ✅ 並列実行（速い）
await Promise.all([
  loadProjects(),
  loadMonthlyIncome(),
  loadTasks()
]);
```

#### 必要なカラムのみ取得
```typescript
// ❌ 全カラム取得
.select('*')

// ✅ 必要なカラムのみ
.select('id, name, reward, status')
```

### 11.2 レンダリング最適化

#### useMemo によるメモ化
```typescript
const thisMonthIncome = useMemo(() =>
  projects.reduce((sum, p) => sum + p.reward, 0),
  [projects]
);
```

#### useCallback によるコールバック最適化
```typescript
const handleDelete = useCallback(async (id: string) => {
  // 削除処理
}, []);
```

### 11.3 コード分割

現在の実装:
- React Router の lazy loading は未実装
- 将来的な検討事項

---

## 12. セキュリティ考慮事項

### 12.1 認証

- Supabase Authによる安全な認証
- パスワードは6文字以上を要求
- セッションは自動で管理

### 12.2 データアクセス

- Row Level Security (RLS) による厳格なアクセス制御
- ユーザーは自分のデータのみアクセス可能
- データベーストリガーによる自動レコード作成

### 12.3 フロントエンド

- XSS対策: Reactの自動エスケープ
- CSRF対策: SupabaseのトークンベースAPI
- 環境変数: 機密情報は.envファイルで管理

---

## 13. テスト戦略

現在の実装:
- 手動テストのみ実施

将来的な実装検討事項:
- ユニットテスト (Vitest)
- 統合テスト (React Testing Library)
- E2Eテスト (Playwright)

---

## 14. デプロイメント

### 14.1 ビルドコマンド
```bash
npm run build
```

### 14.2 出力
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── [その他の静的ファイル]
```

### 14.3 環境変数

必須:
- `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase公開鍵

---

## 15. 今後の拡張予定

### 15.1 短期（1-3ヶ月）

- AIチャットのDify API連携
- 動画講義機能の実装
- お知らせ機能の実装
- 週報機能の実装

### 15.2 中期（3-6ヶ月）

- リアルタイム通知機能
- チーム機能（メンター・メンティー）
- 成果物ポートフォリオ機能
- 営業文テンプレート機能

### 15.3 長期（6ヶ月以上）

- モバイルアプリ化（React Native）
- オフライン対応
- データエクスポート機能
- 高度な分析ダッシュボード

---

**ドキュメント作成日**: 2025年12月22日
**バージョン**: 1.0
