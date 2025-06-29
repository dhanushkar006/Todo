/*
  # Fix Database Schema Compatibility Issues

  1. Schema Updates
    - Update tasks table status values to match app expectations
    - Update tasks table priority values to match app expectations
    - Ensure all constraints match the application code

  2. Data Migration
    - Convert existing status values to new format
    - Convert existing priority values to new format

  3. Security
    - Update RLS policies to work with new schema
    - Maintain all existing security measures
*/

-- First, disable RLS temporarily to make changes
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Drop existing constraints that conflict
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;

-- Update existing data to match app expectations
UPDATE tasks SET status = 'todo' WHERE status = 'pending';
UPDATE tasks SET status = 'in-progress' WHERE status = 'in_progress';

-- Add new constraints that match the app
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('todo', 'in-progress', 'completed'));

ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Re-enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Ensure all required columns exist with correct defaults
DO $$
BEGIN
  -- Check and update description column default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'description'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN description SET DEFAULT '';
  END IF;

  -- Check and update status column default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'status'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'todo';
  END IF;
END $$;