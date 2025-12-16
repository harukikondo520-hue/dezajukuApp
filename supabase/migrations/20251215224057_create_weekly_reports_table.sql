/*
  # Create weekly_reports table for weekly report submissions

  1. New Tables
    - `weekly_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `bottleneck` (text, describes current bottlenecks/challenges)
      - `achievement_link` (text, link to this week's deliverables)
      - `other` (text, other notes or comments)
      - `submitted_at` (timestamptz, when the report was submitted)
      - `created_at` (timestamptz, when the record was created)
  
  2. Security
    - Enable RLS on `weekly_reports` table
    - Add policy for authenticated users to read their own reports
    - Add policy for authenticated users to insert their own reports
    - Add policy for authenticated users to update their own reports
    - Add policy for authenticated users to delete their own reports
  
  3. Indexes
    - Add index on user_id and submitted_at for efficient queries
*/

CREATE TABLE IF NOT EXISTS weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bottleneck text NOT NULL DEFAULT '',
  achievement_link text NOT NULL DEFAULT '',
  other text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weekly reports"
  ON weekly_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reports"
  ON weekly_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reports"
  ON weekly_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reports"
  ON weekly_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_submitted 
  ON weekly_reports(user_id, submitted_at DESC);