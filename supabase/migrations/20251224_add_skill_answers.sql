-- スキル診断の回答を保存するカラムを追加
ALTER TABLE skill_diagnosis
ADD COLUMN IF NOT EXISTS skill_answers JSONB;

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_skill_diagnosis_skill_answers 
ON skill_diagnosis USING GIN (skill_answers);

