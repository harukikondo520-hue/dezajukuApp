/*
  # Fix User Signup with Database Trigger

  ## Problem
  User signup was failing due to RLS policy violation. When a user signs up,
  the application tries to insert a record into the public.users table, but
  the session might not be established yet, causing a permission error.

  ## Solution
  Create a database trigger that automatically creates a public.users record
  when a new user is created in auth.users. This approach:
  - Eliminates race conditions with session establishment
  - Ensures data consistency
  - Simplifies application code

  ## Changes
  1. Create a function to handle new user creation
  2. Add a trigger on auth.users table to call this function
  3. Update RLS policy to allow the trigger to insert records

  ## Security
  - The trigger runs with SECURITY DEFINER, allowing it to bypass RLS
  - Only new auth.users trigger the function
  - Application code no longer needs to manually insert into users table
*/

-- Create function to handle new user creation
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
  );
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();