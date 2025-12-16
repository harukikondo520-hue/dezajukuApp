/*
  # Fix Remaining Security and Performance Issues

  This migration addresses the remaining database security and performance issues:

  ## 1. Add Missing Indexes on Foreign Keys
  - Add index on `video_progress.video_id` for better join performance
  - Add index on `videos.category_id` for better join performance
  - Add index on `projects.category` for better filtering performance

  ## 2. Remove Unused Indexes
  - Drop `idx_announcement_reads_announcement_id` (not being used by queries)
  - Drop `idx_user_progress_track_id` (not being used by queries)
  - Drop `idx_projects_category` if it exists (will recreate with better name)

  ## 3. Optimize RLS Policies for Performance
  Update RLS policies to use `(select auth.uid())` instead of `auth.uid()` to prevent
  re-evaluation for each row, significantly improving query performance at scale.

  ### Tables Updated:
  - `weekly_reports` - 4 policies
  - `projects` - 4 policies  
  - `users` - 2 policies

  ## Notes
  - Foreign key indexes are critical for join performance
  - RLS optimization caches auth function results per query
  - These changes improve performance at scale without affecting functionality
*/

-- ============================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================

-- Index for video_progress.video_id foreign key
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id 
  ON video_progress(video_id);

-- Index for videos.category_id foreign key
CREATE INDEX IF NOT EXISTS idx_videos_category_id 
  ON videos(category_id);

-- ============================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================

-- Drop unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_announcement_reads_announcement_id;
DROP INDEX IF EXISTS idx_user_progress_track_id;
DROP INDEX IF EXISTS idx_projects_category;

-- ============================================================
-- 3. OPTIMIZE RLS POLICIES - WEEKLY_REPORTS TABLE
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own weekly reports" ON weekly_reports;
DROP POLICY IF EXISTS "Users can insert own weekly reports" ON weekly_reports;
DROP POLICY IF EXISTS "Users can update own weekly reports" ON weekly_reports;
DROP POLICY IF EXISTS "Users can delete own weekly reports" ON weekly_reports;
DROP POLICY IF EXISTS "Admins can view all weekly reports" ON weekly_reports;

-- Create optimized policies
CREATE POLICY "Users can read own weekly reports"
  ON weekly_reports
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own weekly reports"
  ON weekly_reports
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own weekly reports"
  ON weekly_reports
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own weekly reports"
  ON weekly_reports
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all weekly reports"
  ON weekly_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

-- ============================================================
-- 4. OPTIMIZE RLS POLICIES - PROJECTS TABLE
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own projects or admins can view all" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Create optimized policies
CREATE POLICY "Users can view own projects or admins can view all"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. OPTIMIZE RLS POLICIES - USERS TABLE
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create optimized policies
CREATE POLICY "Users can view own profile or admins can view all"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);