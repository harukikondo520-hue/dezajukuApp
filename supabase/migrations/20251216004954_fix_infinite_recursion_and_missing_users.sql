/*
  # Fix Infinite Recursion and Missing Users

  ## Problem
  1. The users table SELECT policy causes infinite recursion because it references 
     the users table itself in the EXISTS clause to check for admin status.
  2. Users exist in auth.users but not in public.users, causing foreign key 
     violations when trying to create projects.

  ## Solution
  1. Fix the infinite recursion by creating a simpler admin check policy
  2. Insert any existing auth.users records into public.users
  3. Simplify the RLS policies to avoid circular dependencies

  ## Changes
  1. Drop all existing policies on users and projects tables
  2. Create new, simpler policies that avoid infinite recursion
  3. Insert missing users from auth.users into public.users
  4. Ensure the trigger for future user creation is in place

  ## Security
  - Users can only view and update their own profile
  - Admins functionality removed to prevent recursion issues
  - All data access properly restricted by user_id
*/

-- ============================================================
-- 1. FIX USERS TABLE POLICIES - REMOVE INFINITE RECURSION
-- ============================================================

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. FIX PROJECTS TABLE POLICIES
-- ============================================================

-- Drop all existing policies on projects table
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects or admins can view all" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Create simple policies without admin checks
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. INSERT MISSING USERS FROM AUTH.USERS
-- ============================================================

-- Insert any users from auth.users that don't exist in public.users
INSERT INTO public.users (id, name, role, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', ''),
  'free',
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. ENSURE TRIGGER EXISTS FOR FUTURE USER CREATION
-- ============================================================

-- Recreate the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();