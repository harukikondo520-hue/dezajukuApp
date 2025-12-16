/*
  # Phase 2 Features - Database Schema

  ## New Tables

  1. **monthly_surveys** - 月次アンケート
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users)
    - `target_month` (date) - 対象月（YYYY-MM-01形式）
    - `target_income` (integer) - 目標月収
    - `expected_projects` (integer) - 見込み案件数
    - `study_hours_goal` (integer) - 学習時間目標（時間/月）
    - `motivation` (text) - モチベーション・意気込み
    - `created_at` (timestamp)

  2. **learning_tracks** - 学習コース
    - `id` (uuid, primary key)
    - `title` (text) - コース名
    - `description` (text) - 説明
    - `category` (text) - カテゴリ
    - `total_lessons` (integer) - 総レッスン数
    - `order_index` (integer) - 表示順
    - `created_at` (timestamp)

  3. **user_progress** - ユーザーの学習進捗
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users)
    - `track_id` (uuid, FK to learning_tracks)
    - `completed_lessons` (integer) - 完了レッスン数
    - `last_studied_at` (timestamp) - 最終学習日
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  4. **announcements** - お知らせ
    - `id` (uuid, primary key)
    - `title` (text) - タイトル
    - `content` (text) - 内容
    - `category` (text) - カテゴリ
    - `published_at` (timestamp) - 公開日時
    - `created_at` (timestamp)

  5. **announcement_reads** - お知らせ既読管理
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users)
    - `announcement_id` (uuid, FK to announcements)
    - `read_at` (timestamp)

  ## Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Announcements are readable by all authenticated users
    - Only admins can create/update announcements (for future admin feature)
*/

-- Create monthly_surveys table
CREATE TABLE IF NOT EXISTS monthly_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_month date NOT NULL,
  target_income integer NOT NULL DEFAULT 0,
  expected_projects integer NOT NULL DEFAULT 0,
  study_hours_goal integer NOT NULL DEFAULT 0,
  motivation text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_month)
);

ALTER TABLE monthly_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own surveys"
  ON monthly_surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own surveys"
  ON monthly_surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own surveys"
  ON monthly_surveys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own surveys"
  ON monthly_surveys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create learning_tracks table
CREATE TABLE IF NOT EXISTS learning_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  total_lessons integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning tracks"
  ON learning_tracks FOR SELECT
  TO authenticated
  USING (true);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id uuid REFERENCES learning_tracks(id) ON DELETE CASCADE NOT NULL,
  completed_lessons integer NOT NULL DEFAULT 0,
  last_studied_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, track_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'update',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (published_at <= now());

-- Create announcement_reads table
CREATE TABLE IF NOT EXISTS announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own announcement reads"
  ON announcement_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own announcement reads"
  ON announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own announcement reads"
  ON announcement_reads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample learning tracks
INSERT INTO learning_tracks (title, description, category, total_lessons, order_index)
VALUES
  ('デザインの基礎', 'デザインの基本原則、色彩理論、タイポグラフィを学びます', 'design_basics', 12, 1),
  ('Figma入門', 'Figmaの基本操作からプロトタイプ作成まで', 'figma', 15, 2),
  ('Illustrator基礎', 'Illustratorを使ったロゴデザイン、イラスト作成', 'illustrator', 18, 3),
  ('Photoshop基礎', 'Photoshopを使った画像編集、レタッチ技術', 'photoshop', 16, 4),
  ('Webデザイン', 'Webサイトのデザイン手法とUIデザイン', 'web_design', 20, 5),
  ('ポートフォリオ制作', '魅力的なポートフォリオの作り方', 'portfolio', 10, 6)
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, content, category, published_at)
VALUES
  ('デザジュクへようこそ！', 'デザジュクへようこそ！このアプリでは、案件管理や学習進捗の記録、目標設定などができます。一緒にデザインスキルを磨いていきましょう！', 'important', now() - interval '7 days'),
  ('新しい学習コンテンツが追加されました', 'Webデザインコースに新しいレッスンが5つ追加されました。ぜひチェックしてみてください。', 'update', now() - interval '3 days'),
  ('月初アンケートのお願い', '今月の目標を設定しましょう！アンケートページから目標月収や学習時間を記録できます。', 'event', now() - interval '1 day')
ON CONFLICT DO NOTHING;