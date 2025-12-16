/*
  # 案件テーブルのステータスをカテゴリに変更

  1. **変更内容**
     - `projects` テーブルの `status` カラムを削除
     - `projects` テーブルに `category` カラムを追加
     - カテゴリは「サムネイル」「スライド資料」「HP」「LP」などから選択可能

  2. **新しいカラム**
     - `category` (text) - 案件のカテゴリ（thumbnail/slide/hp/lp/banner/logo/flyer/other）

  3. **データ移行**
     - 既存データの status は削除されます（新しいカテゴリ体系に移行）

  ## Notes
  - 既存の status カラムは削除され、新しい category カラムに置き換わります
  - デフォルト値は 'other' に設定されます
*/

-- Drop the old status column and add new category column
ALTER TABLE projects DROP COLUMN IF EXISTS status;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'other' 
  CHECK (category IN ('thumbnail', 'slide', 'hp', 'lp', 'banner', 'logo', 'flyer', 'other'));

-- Update the index
DROP INDEX IF EXISTS idx_projects_status;
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);