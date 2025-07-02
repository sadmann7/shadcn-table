-- Create function to generate nanoid-like IDs (matching Drizzle schema)
CREATE OR REPLACE FUNCTION generate_task_id()
RETURNS varchar(30)
LANGUAGE sql
AS $$
  SELECT string_agg(
    substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 
           ceil(random() * 62)::integer, 1), 
    ''
  )
  FROM generate_series(1, 12);
$$;

-- Create the tasks table matching Drizzle schema exactly
CREATE TABLE shadcn_tasks (
    id varchar(30) PRIMARY KEY DEFAULT generate_task_id(),
    code varchar(128) NOT NULL UNIQUE,
    title varchar(128),
    status varchar(30) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done', 'canceled')),
    label varchar(30) NOT NULL DEFAULT 'bug' CHECK (label IN ('bug', 'feature', 'enhancement', 'documentation')),
    priority varchar(30) NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_hours real NOT NULL DEFAULT 0,
    archived boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_shadcn_tasks_updated_at 
    BEFORE UPDATE ON shadcn_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_shadcn_tasks_status ON shadcn_tasks(status);
CREATE INDEX idx_shadcn_tasks_priority ON shadcn_tasks(priority);
CREATE INDEX idx_shadcn_tasks_label ON shadcn_tasks(label);
CREATE INDEX idx_shadcn_tasks_created_at ON shadcn_tasks(created_at);
CREATE INDEX idx_shadcn_tasks_code ON shadcn_tasks(code);