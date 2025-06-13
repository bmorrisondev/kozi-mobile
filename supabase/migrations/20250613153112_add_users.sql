-- Add userId column to tasks table
ALTER TABLE tasks ADD COLUMN ownerId TEXT NOT NULL;

-- Create empty requesting_owner_id function (to be filled in later)
create or replace function requesting_owner_id()
returns text as $$
    select coalesce(
        (auth.jwt() -> 'o'::text) ->> 'id'::text,
        (auth.jwt() ->> 'sub'::text)
    )::text;
$$ language sql stable;

-- Enable Row Level Security on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting tasks
CREATE POLICY select_own_tasks ON tasks
  FOR SELECT
  USING (ownerId = requesting_owner_id());

-- Create policy for inserting tasks
CREATE POLICY insert_own_tasks ON tasks
  FOR INSERT
  WITH CHECK (ownerId = requesting_owner_id());

-- Create policy for updating tasks
CREATE POLICY update_own_tasks ON tasks
  FOR UPDATE
  USING (ownerId = requesting_owner_id());

-- Create policy for deleting tasks
CREATE POLICY delete_own_tasks ON tasks
  FOR DELETE
  USING (ownerId = requesting_owner_id());
