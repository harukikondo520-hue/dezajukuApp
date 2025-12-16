/*
  # 案件完了機能の追加

  1. **変更内容**
     - `projects` テーブルに `completed_at` カラムを追加
     - 案件が完了した日時を記録し、完了済み案件を管理可能にする

  2. **新しいカラム**
     - `completed_at` (timestamptz, nullable) - 案件が完了した日時
       - NULL = 未完了（進行中）
       - 日時が設定されている = 完了済み

  3. **インデックス**
     - `completed_at` にインデックスを追加し、完了済み/未完了でのフィルタリングを高速化

  ## Notes
  - 完了済み案件は一覧から非表示にできます
  - 完了日時を記録することで、収入の推移や統計分析に活用できます
*/

-- Add completed_at column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL;

-- Create index for efficient filtering of completed/active projects
CREATE INDEX IF NOT EXISTS idx_projects_completed_at ON projects(completed_at);

-- Add comment to the column for documentation
COMMENT ON COLUMN projects.completed_at IS 'Timestamp when the project was marked as completed. NULL means the project is still active.';
