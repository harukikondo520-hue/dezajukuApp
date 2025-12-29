-- Phase 1: 基盤整備 - データベース設計変更

-- usersテーブルに目標・悩みカラムを追加
ALTER TABLE users
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS current_problem TEXT;

-- diagnosisテーブルに価値観カラムを追加（JSONB配列）
ALTER TABLE diagnosis
ADD COLUMN IF NOT EXISTS values JSONB DEFAULT '[]'::jsonb;

-- skill_diagnosisテーブルにも価値観カラムを追加
ALTER TABLE skill_diagnosis
ADD COLUMN IF NOT EXISTS values JSONB DEFAULT '[]'::jsonb;

-- conversationsテーブルにモードカラムを追加
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'free_talk' CHECK (mode IN ('project_support', 'self_analysis', 'free_talk'));

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_diagnosis_values ON diagnosis USING GIN (values);
CREATE INDEX IF NOT EXISTS idx_skill_diagnosis_values ON skill_diagnosis USING GIN (values);
CREATE INDEX IF NOT EXISTS idx_conversations_mode ON conversations(mode);

-- コメント追加
COMMENT ON COLUMN users.goal IS 'ユーザーの目標（月収目標、なりたい姿など）';
COMMENT ON COLUMN users.current_problem IS 'ユーザーが現在抱えている課題・悩み';
COMMENT ON COLUMN diagnosis.values IS 'デザイナーとしての価値観（3つの自由記述回答のJSON配列）';
COMMENT ON COLUMN skill_diagnosis.values IS 'デザイナーとしての価値観（3つの自由記述回答のJSON配列）';
COMMENT ON COLUMN conversations.mode IS 'チャットモード: project_support（案件サポート）, self_analysis（自己分析）, free_talk（壁打ち）';

