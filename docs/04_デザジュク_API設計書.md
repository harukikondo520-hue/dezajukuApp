# デザジュクアプリ API設計書

## 1. 概要

### 1.1 API 構成

本アプリケーションでは以下の2つのAPIを使用します。

| API | 用途 | 認証方式 |
|-----|------|---------|
| Supabase API | データベース操作、認証 | JWT (Supabase Auth) |
| Dify API | AIチャット | API Key |

### 1.2 ベースURL

| 環境 | Supabase | Dify |
|------|----------|------|
| 開発 | `https://{project}.supabase.co` | `https://api.dify.ai/v1` |
| 本番 | `https://{project}.supabase.co` | `https://api.dify.ai/v1` |

---

## 2. 認証 API (Supabase Auth)

### 2.1 サインアップ

新規ユーザーを登録します。

**エンドポイント**: Supabase Client SDK
**メソッド**: `supabase.auth.signUp()`

#### リクエスト

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: '山田太郎'
    }
  }
});
```

#### レスポンス（成功）

```typescript
{
  data: {
    user: {
      id: 'uuid-xxx',
      email: 'user@example.com',
      user_metadata: {
        name: '山田太郎'
      },
      created_at: '2024-12-22T10:00:00Z'
    },
    session: {
      access_token: 'jwt-token-xxx',
      refresh_token: 'refresh-token-xxx',
      expires_in: 3600
    }
  },
  error: null
}
```

#### レスポンス（エラー）

```typescript
{
  data: { user: null, session: null },
  error: {
    message: 'User already registered',
    status: 400
  }
}
```

---

### 2.2 サインイン

既存ユーザーでログインします。

**エンドポイント**: Supabase Client SDK
**メソッド**: `supabase.auth.signInWithPassword()`

#### リクエスト

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

#### レスポンス（成功）

```typescript
{
  data: {
    user: {
      id: 'uuid-xxx',
      email: 'user@example.com',
      user_metadata: {
        name: '山田太郎'
      }
    },
    session: {
      access_token: 'jwt-token-xxx',
      refresh_token: 'refresh-token-xxx',
      expires_in: 3600
    }
  },
  error: null
}
```

---

### 2.3 サインアウト

ログアウトします。

**メソッド**: `supabase.auth.signOut()`

#### リクエスト

```typescript
const { error } = await supabase.auth.signOut();
```

---

### 2.4 セッション取得

現在のセッションを取得します。

**メソッド**: `supabase.auth.getSession()`

#### リクエスト

```typescript
const { data: { session }, error } = await supabase.auth.getSession();
```

---

## 3. ユーザー API

### 3.1 ユーザー情報取得

**テーブル**: `users`
**メソッド**: SELECT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

#### レスポンス

```typescript
{
  id: 'uuid-xxx',
  email: 'user@example.com',
  name: '山田太郎',
  avatar_url: null,
  goal: '月収30万円を達成する',
  current_problem: '単価が上がらない',
  onboarding_completed: true,
  created_at: '2024-12-22T10:00:00Z',
  updated_at: '2024-12-22T10:00:00Z'
}
```

---

### 3.2 ユーザー作成

サインアップ後にユーザーレコードを作成します。

**テーブル**: `users`
**メソッド**: INSERT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('users')
  .insert({
    id: userId, // auth.uid()
    email: 'user@example.com',
    name: '山田太郎'
  })
  .select()
  .single();
```

---

### 3.3 ユーザー情報更新

**テーブル**: `users`
**メソッド**: UPDATE

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('users')
  .update({
    name: '山田花子',
    goal: '月収50万円を達成する',
    current_problem: '営業が苦手',
    onboarding_completed: true
  })
  .eq('id', userId)
  .select()
  .single();
```

---

## 4. 診断 API

### 4.1 診断結果保存

**テーブル**: `diagnosis_results`
**メソッド**: INSERT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('diagnosis_results')
  .insert({
    user_id: userId,
    designer_type: 'artist',
    design_skill: 88,
    planning_skill: 65,
    client_skill: 52,
    business_skill: 45,
    mindset_skill: 78,
    values_1: '美しいデザインを作ること',
    values_2: '月収100万円のデザイナー',
    values_3: '家族との時間',
    raw_answers: {
      q1: 5, q2: 4, q3: 5, q4: 4,
      q5: 3, q6: 4, q7: 3, q8: 3,
      q9: 3, q10: 3, q11: 2, q12: 3,
      q13: 2, q14: 2, q15: 3, q16: 2,
      q17: 4, q18: 4, q19: 3, q20: 4
    }
  })
  .select()
  .single();
```

#### レスポンス

```typescript
{
  id: 'uuid-xxx',
  user_id: 'user-uuid-xxx',
  designer_type: 'artist',
  design_skill: 88,
  planning_skill: 65,
  client_skill: 52,
  business_skill: 45,
  mindset_skill: 78,
  values_1: '美しいデザインを作ること',
  values_2: '月収100万円のデザイナー',
  values_3: '家族との時間',
  raw_answers: { ... },
  created_at: '2024-12-22T10:00:00Z'
}
```

---

### 4.2 最新診断結果取得

**テーブル**: `diagnosis_results`
**メソッド**: SELECT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('diagnosis_results')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

---

### 4.3 診断履歴取得

**テーブル**: `diagnosis_results`
**メソッド**: SELECT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('diagnosis_results')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

---

## 5. 案件 API

### 5.1 案件一覧取得

**テーブル**: `projects`
**メソッド**: SELECT

#### リクエスト

```typescript
// 全件取得
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// ステータスでフィルタ
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'in_progress')
  .order('created_at', { ascending: false });

// 今月の案件のみ
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', startOfMonth)
  .order('created_at', { ascending: false });
```

#### レスポンス

```typescript
[
  {
    id: 'uuid-xxx',
    user_id: 'user-uuid-xxx',
    name: 'LP制作（A社）',
    amount: 50000,
    status: 'in_progress',
    client_name: 'A株式会社',
    project_type: 'lp',
    work_hours: 10.5,
    deadline: '2024-12-31',
    memo: '初回取引',
    created_at: '2024-12-22T10:00:00Z',
    updated_at: '2024-12-22T10:00:00Z'
  },
  // ...
]
```

---

### 5.2 案件作成

**テーブル**: `projects`
**メソッド**: INSERT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: userId,
    name: 'LP制作（A社）',
    amount: 50000,
    status: 'in_progress',
    client_name: 'A株式会社',      // 任意
    project_type: 'lp',            // 任意
    work_hours: null,              // 任意
    deadline: '2024-12-31',        // 任意
    memo: '初回取引'               // 任意
  })
  .select()
  .single();
```

---

### 5.3 案件更新

**テーブル**: `projects`
**メソッド**: UPDATE

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('projects')
  .update({
    status: 'completed',
    work_hours: 12.5
  })
  .eq('id', projectId)
  .eq('user_id', userId) // RLS による保護に加えて明示的に指定
  .select()
  .single();
```

---

### 5.4 案件削除

**テーブル**: `projects`
**メソッド**: DELETE

#### リクエスト

```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
  .eq('user_id', userId);
```

---

## 6. 収入集計 API

### 6.1 今月の収入取得

**テーブル**: `projects`
**メソッド**: SELECT with aggregation

#### リクエスト

```typescript
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString();

const { data, error } = await supabase
  .from('projects')
  .select('amount')
  .eq('user_id', userId)
  .in('status', ['completed', 'paid'])
  .gte('created_at', startOfMonth)
  .lte('created_at', endOfMonth);

const totalIncome = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
```

---

### 6.2 月別収入推移取得

**ビュー**: `monthly_income_summary`
**メソッド**: SELECT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('monthly_income_summary')
  .select('*')
  .eq('user_id', userId)
  .order('month', { ascending: false })
  .limit(6);
```

#### レスポンス

```typescript
[
  {
    user_id: 'user-uuid-xxx',
    month: '2024-12-01T00:00:00Z',
    project_count: 3,
    total_income: 120000,
    average_amount: 40000
  },
  {
    user_id: 'user-uuid-xxx',
    month: '2024-11-01T00:00:00Z',
    project_count: 2,
    total_income: 90000,
    average_amount: 45000
  },
  // ...
]
```

---

## 7. チャット API

### 7.1 チャットセッション作成

**テーブル**: `chat_sessions`
**メソッド**: INSERT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('chat_sessions')
  .insert({
    user_id: userId,
    mode: 'free_talk'
  })
  .select()
  .single();
```

---

### 7.2 チャットセッション取得（最新）

**テーブル**: `chat_sessions`
**メソッド**: SELECT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('chat_sessions')
  .select('*')
  .eq('user_id', userId)
  .eq('mode', mode)
  .order('updated_at', { ascending: false })
  .limit(1)
  .single();
```

---

### 7.3 チャットセッション更新（Dify conversation_id 保存）

**テーブル**: `chat_sessions`
**メソッド**: UPDATE

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('chat_sessions')
  .update({
    dify_conversation_id: 'conv_xxx'
  })
  .eq('id', sessionId)
  .select()
  .single();
```

---

### 7.4 チャットメッセージ保存

**テーブル**: `chat_messages`
**メソッド**: INSERT

#### リクエスト

```typescript
// ユーザーメッセージとAIレスポンスを保存
const { data, error } = await supabase
  .from('chat_messages')
  .insert([
    {
      session_id: sessionId,
      role: 'user',
      content: '単価を上げる方法を教えてください'
    },
    {
      session_id: sessionId,
      role: 'assistant',
      content: 'いい質問ですね。あなたの診断結果を見ると...'
    }
  ])
  .select();
```

---

### 7.5 チャット履歴取得

**テーブル**: `chat_messages`
**メソッド**: SELECT

#### リクエスト

```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('session_id', sessionId)
  .order('created_at', { ascending: true });
```

#### レスポンス

```typescript
[
  {
    id: 'uuid-xxx',
    session_id: 'session-uuid-xxx',
    role: 'user',
    content: '単価を上げる方法を教えてください',
    created_at: '2024-12-22T10:00:00Z'
  },
  {
    id: 'uuid-yyy',
    session_id: 'session-uuid-xxx',
    role: 'assistant',
    content: 'いい質問ですね。あなたの診断結果を見ると...',
    created_at: '2024-12-22T10:00:05Z'
  }
]
```

---

## 8. Dify Chat API

### 8.1 メッセージ送信

**エンドポイント**: `POST /chat-messages`

#### リクエスト

```typescript
const response = await fetch('https://api.dify.ai/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DIFY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {
      user_name: '山田太郎',
      designer_type: 'アーティスト型',
      design_skill: '88',
      planning_skill: '65',
      client_skill: '52',
      business_skill: '45',
      mindset_skill: '78',
      values: '美しいデザインを作ること',
      goal: '月収30万円',
      current_problem: '単価が上がらない',
      monthly_income: '120000',
      average_price: '40000',
      projects: 'LP制作(A社): ¥50,000 進行中, バナー(B社): ¥20,000 進行中'
    },
    query: '単価を上げる方法を教えてください',
    user: userId,
    conversation_id: conversationId || undefined, // 継続会話の場合
    response_mode: 'streaming'
  })
});
```

#### レスポンス（Streaming）

```typescript
// Server-Sent Events 形式

// 開始
data: {"event": "message", "conversation_id": "conv_xxx", "message_id": "msg_xxx", "answer": "", "created_at": 1234567890}

// メッセージ（チャンクごと）
data: {"event": "message", "conversation_id": "conv_xxx", "message_id": "msg_xxx", "answer": "いい", "created_at": 1234567890}
data: {"event": "message", "conversation_id": "conv_xxx", "message_id": "msg_xxx", "answer": "質問", "created_at": 1234567890}
data: {"event": "message", "conversation_id": "conv_xxx", "message_id": "msg_xxx", "answer": "です", "created_at": 1234567890}

// 終了
data: {"event": "message_end", "conversation_id": "conv_xxx", "message_id": "msg_xxx"}
```

#### ストリーミング処理例

```typescript
async function sendChatMessage(
  query: string,
  userContext: UserContext,
  conversationId?: string,
  onChunk?: (text: string) => void
): Promise<{ answer: string; conversationId: string }> {
  const response = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: buildInputs(userContext),
      query,
      user: userContext.userId,
      conversation_id: conversationId,
      response_mode: 'streaming'
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = '';
  let newConversationId = conversationId || '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = JSON.parse(line.replace('data: ', ''));
      
      if (data.event === 'message') {
        fullAnswer += data.answer;
        newConversationId = data.conversation_id;
        onChunk?.(data.answer);
      }
    }
  }

  return { answer: fullAnswer, conversationId: newConversationId };
}
```

---

## 9. エラーハンドリング

### 9.1 Supabase エラー

```typescript
interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

// エラーハンドリング例
const { data, error } = await supabase.from('users').select('*');

if (error) {
  switch (error.code) {
    case 'PGRST116':
      // レコードが見つからない
      break;
    case '42501':
      // 権限エラー（RLS）
      break;
    case '23505':
      // 一意制約違反
      break;
    default:
      console.error('Database error:', error.message);
  }
}
```

### 9.2 Dify エラー

```typescript
interface DifyError {
  code: string;
  message: string;
  status: number;
}

// エラーハンドリング例
if (!response.ok) {
  const error = await response.json();
  
  switch (response.status) {
    case 400:
      // リクエストエラー
      break;
    case 401:
      // 認証エラー
      break;
    case 429:
      // レート制限
      break;
    case 500:
      // サーバーエラー
      break;
  }
}
```

---

## 10. 型定義

### 10.1 リクエスト/レスポンス型

```typescript
// types/api.ts

// ユーザー
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  goal: string | null;
  current_problem: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar_url?: string;
  goal?: string;
  current_problem?: string;
  onboarding_completed?: boolean;
}

// 診断結果
export interface DiagnosisResult {
  id: string;
  user_id: string;
  designer_type: DesignerType;
  design_skill: number;
  planning_skill: number;
  client_skill: number;
  business_skill: number;
  mindset_skill: number;
  values_1: string | null;
  values_2: string | null;
  values_3: string | null;
  raw_answers: Record<string, number>;
  created_at: string;
}

export type DesignerType =
  | 'artist'
  | 'strategist'
  | 'partner'
  | 'business_designer'
  | 'growth'
  | 'all_rounder';

export interface DiagnosisInput {
  designer_type: DesignerType;
  design_skill: number;
  planning_skill: number;
  client_skill: number;
  business_skill: number;
  mindset_skill: number;
  values_1?: string;
  values_2?: string;
  values_3?: string;
  raw_answers: Record<string, number>;
}

// 案件
export interface Project {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  status: ProjectStatus;
  client_name: string | null;
  project_type: ProjectType | null;
  work_hours: number | null;
  deadline: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'in_progress' | 'completed' | 'paid';

export type ProjectType =
  | 'lp'
  | 'banner'
  | 'logo'
  | 'web'
  | 'sns'
  | 'print'
  | 'other';

export interface ProjectInput {
  name: string;
  amount: number;
  status?: ProjectStatus;
  client_name?: string;
  project_type?: ProjectType;
  work_hours?: number;
  deadline?: string;
  memo?: string;
}

// チャット
export interface ChatSession {
  id: string;
  user_id: string;
  mode: ChatMode;
  dify_conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ChatMode = 'free_talk' | 'project_support' | 'self_analysis';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// 収入サマリー
export interface MonthlyIncomeSummary {
  user_id: string;
  month: string;
  project_count: number;
  total_income: number;
  average_amount: number;
}
```

---

**ドキュメント作成日**: 2025年12月
**バージョン**: 1.0
