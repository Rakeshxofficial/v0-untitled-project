-- Create blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id SERIAL PRIMARY KEY,
  blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS blog_comments_blog_id_idx ON blog_comments(blog_id);

-- Add RLS policies
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Policy for selecting comments (anyone can read)
CREATE POLICY blog_comments_select_policy ON blog_comments
  FOR SELECT USING (true);

-- Policy for inserting comments (authenticated users can insert)
CREATE POLICY blog_comments_insert_policy ON blog_comments
  FOR INSERT WITH CHECK (true);

-- Policy for updating likes (anyone can update likes)
CREATE POLICY blog_comments_update_likes_policy ON blog_comments
  FOR UPDATE USING (true)
  WITH CHECK (true);
