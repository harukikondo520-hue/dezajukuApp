/*
  # スキル診断テーブルの作成

  1. 新しいテーブル
    - `skill_diagnosis`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references auth.users)
      - `design_skill` (integer) - 造形力スコア (0-100)
      - `planning_skill` (integer) - 設計力スコア (0-100)
      - `client_skill` (integer) - クライアントワーク力スコア (0-100)
      - `business_skill` (integer) - ビジネス力スコア (0-100)
      - `mindset_skill` (integer) - マインド力スコア (0-100)
      - `designer_type` (text) - デザイナータイプ
      - `raw_answers` (jsonb) - 生の回答データ
      - `diagnosed_at` (timestamptz) - 診断日時
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分の診断結果のみ閲覧・作成・更新可能
    
  3. インデックス
    - user_idにインデックスを作成してクエリを高速化
*/

CREATE TABLE IF NOT EXISTS skill_diagnosis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  design_skill INTEGER NOT NULL CHECK (design_skill >= 0 AND design_skill <= 100),
  planning_skill INTEGER NOT NULL CHECK (planning_skill >= 0 AND planning_skill <= 100),
  client_skill INTEGER NOT NULL CHECK (client_skill >= 0 AND client_skill <= 100),
  business_skill INTEGER NOT NULL CHECK (business_skill >= 0 AND business_skill <= 100),
  mindset_skill INTEGER NOT NULL CHECK (mindset_skill >= 0 AND mindset_skill <= 100),
  designer_type TEXT NOT NULL CHECK (designer_type IN ('artist', 'strategist', 'partner', 'business_designer', 'growth', 'all_rounder')),
  raw_answers JSONB NOT NULL DEFAULT '{}',
  diagnosed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE skill_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnosis"
  ON skill_diagnosis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnosis"
  ON skill_diagnosis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnosis"
  ON skill_diagnosis FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_skill_diagnosis_user_id ON skill_diagnosis(user_id);
