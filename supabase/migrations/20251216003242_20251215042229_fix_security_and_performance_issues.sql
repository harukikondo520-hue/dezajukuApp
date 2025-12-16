/*
  # Fix Security and Performance Issues

  This migration addresses several database security and performance issues:

  1. **Missing Indexes on Foreign Keys**
     - Add index on `announcement_reads.announcement_id`
     - Add index on `user_progress.track_id`

  2. **Optimize RLS Policies**
     - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of auth functions for each row, improving query performance

  3. **Fix Function Search Path**
     - Update `update_updated_at_column` function to have immutable search_path

  4. **Clean Up Unused Indexes**
     - Remove indexes that are not being used by queries

  ## Changes by Table

  ### announcement_reads
  - Add index on foreign key `announcement_id`
  - Optimize 3 RLS policies

  ### user_progress
  - Add index on foreign key `track_id`
  - Optimize 4 RLS policies

  ### users
  - Optimize 3 RLS policies

  ### projects
  - Optimize 4 RLS policies

  ### video_progress
  - Optimize 3 RLS policies

  ### surveys
  - Optimize 3 RLS policies

  ### user_badges
  - Optimize 2 RLS policies

  ### monthly_surveys
  - Optimize 4 RLS policies

  ## Notes
  - These optimizations are critical for performance at scale
  - Auth function results are cached per query when wrapped with SELECT
  - Foreign key indexes improve join performance significantly
*/

-- Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id 
  ON announcement_reads(announcement_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_track_id 
  ON user_progress(track_id);

-- Drop and recreate optimized RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate optimized RLS policies for projects table
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate optimized RLS policies for video_progress table
DROP POLICY IF EXISTS "Users can view own video progress" ON video_progress;
DROP POLICY IF EXISTS "Users can insert own video progress" ON video_progress;
DROP POLICY IF EXISTS "Users can update own video progress" ON video_progress;

CREATE POLICY "Users can view own video progress"
  ON video_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own video progress"
  ON video_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own video progress"
  ON video_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate optimized RLS policies for surveys table
DROP POLICY IF EXISTS "Users can view own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can insert own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can update own surveys" ON surveys;

CREATE POLICY "Users can view own surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own surveys"
  ON surveys FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own surveys"
  ON surveys FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate optimized RLS policies for user_badges table
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate optimized RLS policies for monthly_surveys table
DROP POLICY IF EXISTS "Users can view own surveys" ON monthly_surveys;
DROP POLICY IF EXISTS "Users can create own surveys" ON monthly_surveys;
DROP POLICY IF EXISTS "Users can update own surveys" ON monthly_surveys;
DROP POLICY IF EXISTS "Users can delete own surveys" ON monthly_surveys;

CREATE POLICY "Users can view own surveys"
  ON monthly_surveys FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own surveys"
  ON monthly_surveys FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own surveys"
  ON monthly_surveys FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own surveys"
  ON monthly_surveys FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate optimized RLS policies for user_progress table
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate optimized RLS policies for announcement_reads table
DROP POLICY IF EXISTS "Users can view own announcement reads" ON announcement_reads;
DROP POLICY IF EXISTS "Users can create own announcement reads" ON announcement_reads;
DROP POLICY IF EXISTS "Users can delete own announcement reads" ON announcement_reads;

CREATE POLICY "Users can view own announcement reads"
  ON announcement_reads FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own announcement reads"
  ON announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own announcement reads"
  ON announcement_reads FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix trigger function search path to be immutable
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Remove unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_videos_category_id;
DROP INDEX IF EXISTS idx_video_progress_video_id;
DROP INDEX IF EXISTS idx_surveys_user_id;
DROP INDEX IF EXISTS idx_surveys_month;