-- Ensure we have blog categories in the categories table
INSERT INTO categories (name, slug, type, description)
VALUES 
  ('Tutorials', 'tutorials', 'blog', 'Step-by-step guides and tutorials'),
  ('News', 'news', 'blog', 'Latest news and updates'),
  ('Reviews', 'reviews', 'blog', 'App and game reviews'),
  ('Tips & Tricks', 'tips-and-tricks', 'blog', 'Helpful tips and tricks')
ON CONFLICT (slug) DO NOTHING;

-- Add tags support
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a junction table for blog posts and tags
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_blog_id ON blog_tags(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_tag_id ON blog_tags(tag_id);
