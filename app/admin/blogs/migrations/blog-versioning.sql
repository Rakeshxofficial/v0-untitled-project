-- Create blog_versions table for version control
CREATE TABLE IF NOT EXISTS blog_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  version_number INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint to ensure each blog has unique version numbers
  UNIQUE(blog_id, version_number)
);

-- Add scheduled_at column to blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_versions_blog_id ON blog_versions(blog_id);
CREATE INDEX IF NOT EXISTS idx_blogs_scheduled_at ON blogs(scheduled_at);

-- Create a function to publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts() RETURNS void AS $$
BEGIN
  UPDATE blogs
  SET status = 'published'
  WHERE status = 'scheduled'
    AND scheduled_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the function every hour
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('0 * * * *', 'SELECT publish_scheduled_posts()');
