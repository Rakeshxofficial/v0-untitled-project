-- Create the tags table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample tags
INSERT INTO tags (name, slug) VALUES
  ('Technology', 'technology'),
  ('Mobile Apps', 'mobile-apps'),
  ('Gaming', 'gaming'),
  ('Android', 'android'),
  ('iOS', 'ios'),
  ('Tutorials', 'tutorials'),
  ('News', 'news'),
  ('Reviews', 'reviews')
ON CONFLICT (slug) DO NOTHING;

-- Ensure the blog_tags junction table exists
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_tags_blog_id ON blog_tags(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_tag_id ON blog_tags(tag_id);
