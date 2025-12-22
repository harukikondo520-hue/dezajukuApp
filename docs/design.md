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
│  - カスタムフック                            │
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
│  - Database Functions & Triggers            │
└─────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           外部連携                           │
│  - Dify AI (ハルキAI)                       │
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
| Dify | AI対話機能、ナレッジベース統合 |

---

## 2. ディレクトリ構成

```
src/
├── components/             # 共通コンポーネント
│   ├── Layout.tsx         # レイアウト（ナビゲーション含む）
│   ├── Opening.tsx        # オープニング画面
│   └── home/              # ホーム画面専用コンポーネント
│       ├── TabSwitcher.tsx       # タブ切り替え
│       ├── MyPageContent.tsx     # マイページタブ
│       └── CommunityContent.tsx  # コミュニティタブ
├── contexts/              # React Context
│   └── AuthContext.tsx    # 認証コンテキスト
├── data/                  # 静的データ
│   ├── questions.ts       # 診断質問データ（基本診断）
│   └── diagnosisExQuestions.ts # 診断EX質問データ
├── hooks/                 # カスタムフック
│   ├── useBadges.ts       # バッジ取得フック
│   ├── useProjects.ts     # 案件管理フック
│   ├── useDiagnosis.ts    # 診断データフック
│   └── useCommunityStats.ts # コミュニティ統計フック
├── lib/                   # ユーティリティ
│   ├── supabase.ts        # Supabaseクライアント
│   └── diagnosisCalculator.ts # 診断ロジック
├── pages/                 # ページコンポーネント
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
├── types/                 # 型定義
│   ├── database.ts        # データベース型
│   ├── diagnosis.ts       # 診断関連型
│   ├── diagnosisEx.ts     # 診断EX関連型
│   └── community.ts       # コミュニティ関連型
├── App.tsx                # ルーティング設定
├── main.tsx               # エントリーポイント
└── index.css              # グローバルスタイル
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
[スキル診断（基本20問）] (/onboarding/diagnosis)
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
    │  「次へ」ボタン押下
    │
    ▼
[診断EX（記述5問）] (/diagnosis)
    │
    ├─ 5問に記述回答（各50文字以上）
    │   │
    │   ▼
    │  診断EXデータを保存
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
[activeTab = 'mypage']
    │
    ▼
[MyPageContent.tsx マウント]
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
    ├─ loadVideoProgress() → 動画進捗取得
    │
    └─ checkDiagnosis() → 診断状況確認（基本・EX）
    │
    ▼
[state更新]
    │
    ▼
[UI描画]
    │
    ▼
[診断誘導バナー表示判定]
    ├─ 未診断 → 基本診断への誘導
    └─ 基本診断完了 & EX未完了 → 診断EXへの誘導
```

### 3.4 コミュニティ統計フロー

```
[CommunityContent.tsx マウント]
    │
    ▼
[useCommunityStats() カスタムフック]
    │
    ▼
[並列クエリ実行]
    │
    ├─ 今月の総収入取得
    │   └─ monthly_income テーブルから集計
    │
    ├─ 今月の案件獲得数取得
    │   └─ projects テーブルからカウント
    │
    └─ 月間収益ランキング取得（TOP5）
        └─ monthly_income + users + skill_diagnosis JOIN
    │
    ▼
[state更新]
    │
    ▼
[UI描画]
    ├─ 統計カード表示
    └─ ランキングリスト表示
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
- activeTab: 'mypage' | 'community'  // アクティブタブ
```

#### MyPageContent.tsx
```typescript
- projects: Project[]              // 今月の案件
- allProjects: Project[]           // 全案件
- monthlyIncomeData: MonthlyData[] // 月別収益
- tasks: Task[]                    // ロードマップタスク
- userTasks: UserTask[]            // ユーザータスク進捗
- videoProgress: { completed, total } // 動画進捗
- hasDiagnosis: boolean            // 基本診断完了フラグ
- hasExDiagnosis: boolean          // 診断EX完了フラグ
- showModal: boolean               // モーダル表示
- editingProject: Project | null   // 編集中案件
- formData: { name, reward, status } // フォーム入力
```

#### CommunityContent.tsx
```typescript
- stats: CommunityStats           // コミュニティ統計
  - totalMonthlyIncome: number    // 今月の総収入
  - totalProjects: number         // 今月の案件獲得数
  - averageUnitPrice: number      // 今月の平均単価
  - topEarners: RankingUser[]     // 収益ランキング
- loading: boolean                // ロード状態
```

#### Profile.tsx
```typescript
- diagnosis: DiagnosisResult | null // 診断結果
- exReport: ExReport | null       // 診断EXレポート
  - values: string                // 価値観
  - vision: string                // 3年後の理想像
  - strength: string              // 強み
  - challenge: string             // 課題
  - style: string                 // デザインスタイル
- showFullReport: boolean         // 全文表示フラグ
- unreadCount: number             // 未読お知らせ数
- isEditingName: boolean          // 名前編集中フラグ
- editedName: string              // 編集中の名前
- currentBannerIndex: number      // バナー表示位置
- badges: Badge[]                 // バッジ一覧
```

#### DiagnosisPage.tsx
```typescript
- currentQuestion: number         // 現在の質問番号
- answers: Record<number, number> // 回答データ（基本診断）
- exAnswers: DiagnosisExAnswers   // 診断EX回答データ
  - values: string
  - vision: string
  - strength: string
  - challenge: string
  - style: string
- isSubmitting: boolean           // 送信中フラグ
- showExDiagnosis: boolean        // 診断EX表示フラグ
```

#### AIChat.tsx
```typescript
- difyChatUrl: string | undefined // Dify埋め込みURL
- useDify: boolean                // Dify使用フラグ
- messages: Message[]             // チャット履歴（プレースホルダー用）
- input: string                   // 入力テキスト
- isLoading: boolean              // ロード状態
```

---

## 5. コンポーネント設計

### 5.1 ページコンポーネント

#### Home.tsx
**責務**: ダッシュボードのタブ管理

**主要機能**:
- タブ切り替え（マイページ / コミュニティ）
- 各タブのコンテンツ表示

**データフロー**:
```
useState() → activeTab
  │
  ▼
TabSwitcher → タブクリック
  │
  ▼
setActiveTab() → 再レンダリング
  │
  ├─ activeTab === 'mypage' → MyPageContent
  └─ activeTab === 'community' → CommunityContent
```

#### MyPageContent.tsx
**責務**: マイページタブの表示と案件管理

**主要機能**:
- 月収推移グラフ表示
- 収益統計カード表示
- カリキュラム進捗表示
- ロードマップタスク管理
- 案件CRUD操作
- 診断誘導バナー表示

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
  loadVideoProgress(),
  checkDiagnosis()
])
  │
  ▼
setState() → 再レンダリング
  │
  ▼
診断誘導バナー判定
  ├─ !hasDiagnosis → 基本診断バナー表示
  └─ hasDiagnosis && !hasExDiagnosis → EX診断バナー表示
```

#### CommunityContent.tsx
**責務**: コミュニティタブの表示

**主要機能**:
- 今月の総収入表示
- 今月の案件獲得数表示
- 今月の平均単価表示
- 月間収益ランキング表示（TOP5）

**データフロー**:
```
useCommunityStats() → カスタムフック
  │
  ▼
useEffect() → loadStats()
  │
  ▼
並列クエリ実行
  ├─ 総収入集計
  ├─ 案件数集計
  └─ ランキング取得
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
- 診断EXレポート表示（要約/全文切り替え）
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
診断データ確認
  ├─ ex_values, ex_vision, etc. 存在
  │   └─ setExReport() → レポート表示
  │
useBadges() → バッジ取得
  │
  ▼
setState() → 再レンダリング
```

#### DiagnosisPage.tsx
**責務**: スキル診断の実施（基本診断 + 診断EX）

**主要機能**:
- 基本診断: 20問の5段階評価
- 診断EX: 5問の記述式（各50文字以上）
- プログレスバー表示
- 前へ/次へナビゲーション
- 診断結果計算と保存

**データフロー**:
```
diagnosisQuestions → 基本診断質問データ
diagnosisExQuestions → 診断EX質問データ
  │
  ▼
useState() → answers, exAnswers
  │
  ▼
[基本診断フロー]
handleAnswer() → 回答記録
  │
  ▼
handleComplete() → calculateDiagnosisResult()
  │
  ▼
supabase.from('skill_diagnosis').upsert()
  │
  ▼
showExDiagnosis = true
  │
  ▼
[診断EXフロー]
handleExAnswer() → 記述回答記録
  │
  ▼
handleExComplete() → バリデーション（50文字以上）
  │
  ▼
supabase.from('skill_diagnosis').update()
  │
  ▼
navigate(isOnboarding ? '/' : '/diagnosis/result')
```

#### AIChat.tsx
**責務**: ハルキAIチャット機能

**機能**:
- Dify設定時: iframeでチャットボット埋め込み
- Dify未設定時: プレースホルダーチャット表示

**データフロー**:
```
import.meta.env.VITE_DIFY_CHAT_URL → difyChatUrl
  │
  ▼
useDify = !!difyChatUrl
  │
  ├─ useDify === true
  │   └─ iframeでDify埋め込み
  │
  └─ useDify === false
      └─ プレースホルダーチャット表示
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

#### TabSwitcher.tsx
**責務**: ホーム画面のタブ切り替えUI

**機能**:
- マイページ / コミュニティ の2タブ表示
- アクティブタブのハイライト
- タブクリックイベント処理

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
     ├─ MyPageContent (マイページタブ)
     └─ CommunityContent (コミュニティタブ)

/login (PublicRoute)
  └─ Login.tsx

/signup (PublicRoute)
  └─ SignUp.tsx

/onboarding (OnboardingRoute)
  └─ Onboarding.tsx

/onboarding/diagnosis (OnboardingRoute)
  └─ DiagnosisPage.tsx (基本診断 → 診断EX)

/onboarding/result (OnboardingRoute)
  └─ DiagnosisResultPage.tsx

/chat (PrivateRoute)
  └─ AIChat.tsx (ハルキAI)

/profile (PrivateRoute)
  └─ Profile.tsx

/diagnosis (AuthenticatedRoute)
  └─ DiagnosisPage.tsx (再診断: 基本診断 → 診断EX)

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
    │         ├─1:N─ monthly_income
    │         ├─1:N─ user_tasks
    │         ├─1:N─ video_progress
    │         ├─1:N─ user_badges
    │         ├─1:N─ weekly_reports
    │         └─1:1─ skill_diagnosis (基本診断 + 診断EX)
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

-- monthly_income
CREATE INDEX idx_monthly_income_user_id ON monthly_income(user_id);
CREATE INDEX idx_monthly_income_year_month ON monthly_income(year, month);

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

#### コミュニティ統計用ポリシー

```sql
-- monthly_income: 全ユーザーが全員のデータを閲覧可能（統計用）
CREATE POLICY "All users can view all monthly income for stats"
  ON monthly_income FOR SELECT
  TO authenticated
  USING (true);

-- users: 全ユーザーが名前を閲覧可能（ランキング用）
CREATE POLICY "All users can view user names for ranking"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- skill_diagnosis: 全ユーザーがdesigner_typeを閲覧可能（ランキング用）
CREATE POLICY "All users can view designer types for ranking"
  ON skill_diagnosis FOR SELECT
  TO authenticated
  USING (true);
```

---

## 8. スキル診断ロジック

### 8.1 基本診断（20問）

#### 質問構成

| カテゴリ | 質問数 | 質問ID |
|---------|--------|--------|
| 造形力 (design) | 4 | 1-4 |
| 設計力 (planning) | 4 | 5-8 |
| CW力 (client) | 4 | 9-12 |
| ビジネス力 (business) | 4 | 13-16 |
| マインド力 (mindset) | 4 | 17-20 |

#### スコア計算

```typescript
// 各カテゴリのスコア = (回答の合計 / 最大値) × 100
// 最大値 = 質問数 × 5段階評価の最大値(5) = 4 × 5 = 20

例:
造形力の回答: [5, 4, 5, 4] = 合計18
造形力スコア = (18 / 20) × 100 = 90点
```

#### デザイナータイプ判定

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

#### デザイナータイプ定義

| タイプ | 英語名 | 特徴 | カラー |
|--------|--------|------|--------|
| アーティスト型 | artist | 造形力に優れる | #ef4444（赤） |
| ストラテジスト型 | strategist | 設計力に優れる | #3b82f6（青） |
| パートナー型 | partner | CW力に優れる | #22c55e（緑） |
| ビジネスデザイナー型 | business_designer | ビジネス力に優れる | #f59e0b（オレンジ） |
| グロース型 | growth | マインド力に優れる | #8b5cf6（紫） |
| オールラウンダー型 | all_rounder | バランス型 | #6b7280（グレー） |

### 8.2 診断EX（5問）

#### 質問構成

| 質問ID | 質問内容 | フィールド名 | 最小文字数 |
|-------|---------|------------|-----------|
| 1 | デザインで大切にしている価値観 | ex_values | 50 |
| 2 | 3年後のなりたい姿 | ex_vision | 50 |
| 3 | 強みや得意な領域 | ex_strength | 50 |
| 4 | 現在の課題や悩み | ex_challenge | 50 |
| 5 | デザインスタイルや仕事の進め方 | ex_style | 50 |

#### バリデーション

```typescript
const validateExAnswer = (answer: string): boolean => {
  return answer.trim().length >= 50;
};

const validateAllExAnswers = (answers: DiagnosisExAnswers): boolean => {
  return (
    validateExAnswer(answers.values) &&
    validateExAnswer(answers.vision) &&
    validateExAnswer(answers.strength) &&
    validateExAnswer(answers.challenge) &&
    validateExAnswer(answers.style)
  );
};
```

#### 保存処理

```typescript
// skill_diagnosisテーブルのex_*カラムに保存
await supabase
  .from('skill_diagnosis')
  .update({
    ex_values: exAnswers.values,
    ex_vision: exAnswers.vision,
    ex_strength: exAnswers.strength,
    ex_challenge: exAnswers.challenge,
    ex_style: exAnswers.style,
  })
  .eq('user_id', userId);
```

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

#### 集計クエリ
```typescript
// 今月の総収入
const { data, error } = await supabase
  .from('monthly_income')
  .select('total_income')
  .eq('year', currentYear)
  .eq('month', currentMonth);

const totalIncome = data?.reduce((sum, item) => sum + item.total_income, 0) || 0;
```

#### JOIN クエリ（ランキング用）
```typescript
const { data, error } = await supabase
  .from('monthly_income')
  .select(`
    total_income,
    users!inner(
      id,
      name,
      skill_diagnosis!inner(designer_type)
    )
  `)
  .eq('year', currentYear)
  .eq('month', currentMonth)
  .order('total_income', { ascending: false })
  .limit(5);
```

#### Upsert（存在すれば更新、なければ作成）
```typescript
const { error } = await supabase
  .from('skill_diagnosis')
  .upsert({
    user_id: userId,
    design_skill: 85,
    ex_values: '価値観の回答...',
    // ...
  });
```

---

## 10. カスタムフック

### 10.1 useCommunityStats

**責務**: コミュニティ統計データの取得

```typescript
export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [totalIncome, projectCount, ranking] = await Promise.all([
      fetchTotalMonthlyIncome(),
      fetchTotalProjects(),
      fetchMonthlyRanking()
    ]);

    setStats({
      totalMonthlyIncome: totalIncome,
      totalProjects: projectCount,
      averageUnitPrice: projectCount > 0 ? totalIncome / projectCount : 0,
      topEarners: ranking
    });

    setLoading(false);
  };

  return { stats, loading };
}
```

---

## 11. エラーハンドリング

### 11.1 認証エラー

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

### 11.2 データベースエラー

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

### 11.3 バリデーションエラー

```typescript
// 診断EXのバリデーション
const handleExComplete = () => {
  if (!validateAllExAnswers(exAnswers)) {
    alert('各質問に50文字以上入力してください');
    return;
  }

  // 保存処理
  saveExDiagnosis();
};
```

---

## 12. パフォーマンス最適化

### 12.1 データ取得の最適化

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

### 12.2 レンダリング最適化

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

---

## 13. セキュリティ考慮事項

### 13.1 認証
- Supabase Authによる安全な認証
- パスワードは6文字以上を要求
- セッションは自動で管理

### 13.2 データアクセス
- Row Level Security (RLS) による厳格なアクセス制御
- ユーザーは自分のデータのみアクセス可能
- コミュニティ統計は全ユーザーが閲覧可能（個人情報を除く）
- データベーストリガーによる自動レコード作成

### 13.3 フロントエンド
- XSS対策: Reactの自動エスケープ
- CSRF対策: SupabaseのトークンベースAPI
- 環境変数: 機密情報は.envファイルで管理

---

## 14. 外部連携

### 14.1 Dify統合（ハルキAI）

#### 設定方法

1. 環境変数設定
```bash
# .env
VITE_DIFY_CHAT_URL=https://your-dify-instance.com/chatbot/your-chatbot-id
```

2. iframe埋め込み
```typescript
<iframe
  src={difyChatUrl}
  className="w-full h-full border-0"
  allow="microphone"
/>
```

3. フォールバック
```typescript
const useDify = !!import.meta.env.VITE_DIFY_CHAT_URL;

if (useDify) {
  // Dify埋め込み
} else {
  // プレースホルダーチャット
}
```

詳細は `docs/dify-integration.md` を参照。

---

## 15. デプロイメント

### 15.1 ビルドコマンド
```bash
npm run build
```

### 15.2 出力
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── [その他の静的ファイル]
```

### 15.3 環境変数

必須:
- `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase公開鍵

任意:
- `VITE_DIFY_CHAT_URL`: DifyチャットボットURL（ハルキAI）

---

## 16. 今後の拡張予定

### 16.1 短期（1-3ヶ月）

- Dify AI連携の本番運用
- AI診断EXレポート自動生成
- 動画講義機能の実装
- お知らせ機能の実装
- 週報機能の実装

### 16.2 中期（3-6ヶ月）

- リアルタイム通知機能
- チーム機能（メンター・メンティー）
- 成果物ポートフォリオ機能
- 営業文テンプレート機能
- バッジ自動付与システム

### 16.3 長期（6ヶ月以上）

- モバイルアプリ化（React Native）
- オフライン対応
- データエクスポート機能
- 高度な分析ダッシュボード
- AI による案件マッチング

---

**ドキュメント作成日**: 2025年12月22日
**バージョン**: 2.0
**更新内容**: 診断EX、ハルキAI、コミュニティ機能、ホーム画面のタブ構成、カスタムフックを追加
