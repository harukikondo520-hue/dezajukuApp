/*
  # Add Roadmap and Task System for Learning Management

  1. Schema Changes
    - Add 'status' column to projects table (in_progress, completed, paid)
    - Create 'roadmaps' table for learning paths (案件獲得コース, 収入アップコース)
    - Create 'tasks' table for roadmap tasks (video or action type)
    - Create 'user_tasks' table for tracking task completion
    - Create 'monthly_income' table for 6-month income history
    - Add 'roadmap_id' to users table

  2. Tables Created
    - roadmaps: id, name, description, target_audience, order_index
    - tasks: id, roadmap_id, title, description, task_type (video/action), video_id, order_index
    - user_tasks: id, user_id, task_id, completed, completed_at
    - monthly_income: id, user_id, year_month, total_amount

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated users
*/

-- Add status column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status text DEFAULT 'in_progress'
      CHECK (status IN ('in_progress', 'completed', 'paid'));
  END IF;
END $$;

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  target_audience text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roadmaps"
  ON roadmaps FOR SELECT
  TO authenticated
  USING (true);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES roadmaps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  task_type text DEFAULT 'action' CHECK (task_type IN ('video', 'action')),
  video_id uuid REFERENCES videos(id) ON DELETE SET NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Create user_tasks table for tracking completion
CREATE TABLE IF NOT EXISTS user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task progress"
  ON user_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task progress"
  ON user_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task progress"
  ON user_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create monthly_income table for income history
CREATE TABLE IF NOT EXISTS monthly_income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  year_month text NOT NULL,
  total_amount integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year_month)
);

ALTER TABLE monthly_income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income history"
  ON monthly_income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income history"
  ON monthly_income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income history"
  ON monthly_income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add roadmap_id to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'roadmap_id'
  ) THEN
    ALTER TABLE users ADD COLUMN roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- Insert default roadmaps
INSERT INTO roadmaps (name, description, target_audience, order_index)
VALUES 
  ('案件獲得コース', 'これから案件を獲得したい方向けのロードマップ', 'これから案件を獲得したい人', 1),
  ('収入アップコース', '既に案件があり、収入を増やしていきたい方向けのロードマップ', '既に案件があり、収入を増やしていきたい人', 2)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_roadmap_id ON tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_user_id ON monthly_income(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_year_month ON monthly_income(year_month);
