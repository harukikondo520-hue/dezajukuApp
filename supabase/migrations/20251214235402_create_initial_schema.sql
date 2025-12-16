/*
  # デザジュク生徒アプリ - 初期スキーマ

  ## 新規テーブル
  
  ### users
  ユーザープロフィール情報
  - id (uuid, primary key) - Supabase AuthのユーザーIDと連携
  - name (text) - ユーザー名
  - icon (text) - アイコンID（イラスト選択用）
  - bio (text) - 自己紹介
  - role (text) - ユーザーロール（free/student）
  - last_login_at (timestamptz) - 最終ログイン日時
  - created_at (timestamptz) - 作成日時
  - updated_at (timestamptz) - 更新日時

  ### projects
  案件情報
  - id (uuid, primary key)
  - user_id (uuid, foreign key) - ユーザーID
  - name (text) - 案件名
  - reward (integer) - 報酬額
  - status (text) - ステータス（active/completed/pending）
  - created_at (timestamptz) - 作成日時
  - updated_at (timestamptz) - 更新日時

  ### categories
  動画カテゴリマスターデータ
  - id (uuid, primary key)
  - name (text) - カテゴリ名
  - order_num (integer) - 表示順
  - description (text) - 説明
  - created_at (timestamptz) - 作成日時

  ### videos
  動画マスターデータ
  - id (uuid, primary key)
  - title (text) - タイトル
  - description (text) - 説明
  - youtube_id (text) - YouTube動画ID
  - category_id (uuid, foreign key) - カテゴリID
  - order_num (integer) - 表示順
  - duration (integer) - 動画時間（秒）
  - created_at (timestamptz) - 作成日時

  ### video_progress
  動画視聴進捗
  - id (uuid, primary key)
  - user_id (uuid, foreign key) - ユーザーID
  - video_id (uuid, foreign key) - 動画ID
  - completed (boolean) - 視聴完了フラグ
  - watched_percent (integer) - 視聴率（0-100）
  - last_watched_at (timestamptz) - 最終視聴日時
  - created_at (timestamptz) - 作成日時
  - updated_at (timestamptz) - 更新日時

  ### surveys
  アンケート回答
  - id (uuid, primary key)
  - user_id (uuid, foreign key) - ユーザーID
  - month (text) - 対象月（YYYY-MM形式）
  - target_income (integer) - 目標月収
  - goals (text) - 今月の目標
  - bottleneck (text) - ボトルネック
  - free_text (text) - 自由記入欄
  - submitted_at (timestamptz) - 提出日時
  - created_at (timestamptz) - 作成日時

  ### user_badges
  バッジ取得状況
  - id (uuid, primary key)
  - user_id (uuid, foreign key) - ユーザーID
  - badge_id (text) - バッジID
  - acquired_at (timestamptz) - 取得日時

  ## セキュリティ
  - すべてのテーブルでRLSを有効化
  - ユーザーは自分のデータのみアクセス可能
  - マスターデータ（videos, categories）は全認証ユーザーが読み取り可能
*/

-- users テーブル
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  icon text DEFAULT 'default',
  bio text DEFAULT '',
  role text NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'student')),
  last_login_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- projects テーブル
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  reward integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- categories テーブル
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  order_num integer NOT NULL DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- videos テーブル
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  youtube_id text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  order_num integer NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

-- video_progress テーブル
CREATE TABLE IF NOT EXISTS video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  watched_percent integer DEFAULT 0 CHECK (watched_percent >= 0 AND watched_percent <= 100),
  last_watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video progress"
  ON video_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video progress"
  ON video_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video progress"
  ON video_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- surveys テーブル
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  target_income integer NOT NULL DEFAULT 0,
  goals text NOT NULL DEFAULT '',
  bottleneck text NOT NULL DEFAULT '',
  free_text text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own surveys"
  ON surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own surveys"
  ON surveys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_badges テーブル
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_month ON surveys(month);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- updated_at自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの設定
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_progress_updated_at ON video_progress;
CREATE TRIGGER update_video_progress_updated_at
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();