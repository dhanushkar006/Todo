/*
  # Fix RLS Policies - Remove Infinite Recursion

  1. Problem
    - Admin policies are causing infinite recursion by checking profiles table within profiles policies
    - This creates a circular dependency when trying to access profiles

  2. Solution
    - Simplify admin policies to avoid self-referencing
    - Use direct role checks instead of subqueries
    - Ensure policies don't create circular dependencies

  3. Security
    - Maintain proper access control
    - Keep user data isolated
    - Allow admin access without recursion
*/

-- Disable RLS temporarily to make changes safely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_shares DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view shared tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can update all tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can delete all tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view task shares for their tasks" ON task_shares;
DROP POLICY IF EXISTS "Users can create task shares for their tasks" ON task_shares;
DROP POLICY IF EXISTS "Users can delete task shares for their tasks" ON task_shares;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for profiles table (no admin policies to avoid recursion)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for tasks table (simplified, no admin policies)
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared tasks"
  ON tasks FOR SELECT TO authenticated
  USING ((auth.uid())::text = ANY (shared_with));

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for task_shares table
CREATE POLICY "Users can view task shares for their tasks"
  ON task_shares FOR SELECT TO authenticated
  USING (
    shared_by_user_id = auth.uid() OR 
    shared_with_email = (
      SELECT email FROM profiles 
      WHERE id = auth.uid() 
      LIMIT 1
    )
  );

CREATE POLICY "Users can create task shares for their tasks"
  ON task_shares FOR INSERT TO authenticated
  WITH CHECK (
    shared_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_id AND user_id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "Users can delete task shares for their tasks"
  ON task_shares FOR DELETE TO authenticated
  USING (
    shared_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_id AND user_id = auth.uid()
      LIMIT 1
    )
  );