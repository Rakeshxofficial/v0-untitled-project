-- Add a function to automatically publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts() RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are any scheduled posts that should be published
  UPDATE blogs
  SET status = 'published'
  WHERE status = 'scheduled'
    AND scheduled_at <= NOW();
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs this function periodically
DROP TRIGGER IF EXISTS check_scheduled_posts ON blogs;
CREATE TRIGGER check_scheduled_posts
AFTER INSERT OR UPDATE ON blogs
FOR EACH STATEMENT
EXECUTE FUNCTION publish_scheduled_posts();
