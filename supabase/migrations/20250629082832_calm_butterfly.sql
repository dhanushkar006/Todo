/*
  # Add missing columns to match application requirements

  1. Changes to profiles table
    - Add `full_name` column (text, nullable) for storing user's display name
    
  2. Changes to tasks table  
    - Add `assigned_to` column (text, nullable) for task assignment via email
    
  3. New table: task_shares
    - Create table for managing task sharing permissions
    - Links tasks to shared users with permission levels
    
  4. Security
    - Enable RLS on new task_shares table
    - Add policies for task sharing functionality
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
END $$;

-- Add missing columns to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assigned_to text;
  END IF;
END $$;

-- Create task_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  shared_by_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission text NOT NULL DEFAULT 'read' CHECK (permission IN ('read', 'write')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on task_shares table
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;

-- Add policies for task_shares table
CREATE POLICY "Users can view task shares for their tasks"
  ON task_shares
  FOR SELECT
  TO authenticated
  USING (
    shared_by_user_id = auth.uid() OR 
    shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create task shares for their tasks"
  ON task_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shared_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete task shares for their tasks"
  ON task_shares
  FOR DELETE
  TO authenticated
  USING (
    shared_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_id AND user_id = auth.uid()
    )
  );

-- Add index for better performance on task_shares
CREATE INDEX IF NOT EXISTS idx_task_shares_task_id ON task_shares(task_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_email ON task_shares(shared_with_email);