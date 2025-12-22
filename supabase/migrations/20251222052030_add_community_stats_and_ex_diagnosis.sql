/*
  # コミュニティ統計機能と診断EX機能の追加

  ## 1. コミュニティ統計
    - `community_settings` テーブル作成（累計収益オフセット管理）
    - 初期値として2000万円を設定
    - RLSポリシー設定（全員読み取り可能）

  ## 2. 診断EX機能
    - `skill_diagnosis` テーブルにEX用カラムを追加
      - `ex_answers` (jsonb) - EX診断の回答データ
      - `ex_report` (text) - AIが生成した詳細レポート
      - `ex_summary` (text) - レポートの要約
      - `ex_key_points` (text[]) - 3つのキーポイント
      - `ex_diagnosed_at` (timestamptz) - EX診断日時

  ## 3. セキュリティ
    - community_settingsは認証ユーザー全員が読み取り可能
    - skill_diagnosisの既存RLSポリシーがEX列にも適用
*/

-- コミュニティ設定テーブルの作成
CREATE TABLE IF NOT EXISTS community_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 累計収益オフセットの初期値を挿入（2000万円）
INSERT INTO community_settings (key, value)
VALUES ('cumulative_offset', '{"amount": 20000000, "description": "デザジュク開始時の累計ベース金額"}')
ON CONFLICT (key) DO NOTHING;

-- RLS有効化
ALTER TABLE community_settings ENABLE ROW LEVEL SECURITY;

-- 全認証ユーザーが読み取り可能
CREATE POLICY "Authenticated users can read community settings"
  ON community_settings FOR SELECT
  TO authenticated
  USING (true);

-- skill_diagnosisテーブルにEX用カラムを追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_diagnosis' AND column_name = 'ex_answers'
  ) THEN
    ALTER TABLE skill_diagnosis
    ADD COLUMN ex_answers JSONB DEFAULT NULL,
    ADD COLUMN ex_report TEXT DEFAULT NULL,
    ADD COLUMN ex_summary TEXT DEFAULT NULL,
    ADD COLUMN ex_key_points TEXT[] DEFAULT NULL,
    ADD COLUMN ex_diagnosed_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- インデックス追加（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_community_settings_key ON community_settings(key);
CREATE INDEX IF NOT EXISTS idx_skill_diagnosis_ex_diagnosed_at ON skill_diagnosis(ex_diagnosed_at) WHERE ex_diagnosed_at IS NOT NULL;
