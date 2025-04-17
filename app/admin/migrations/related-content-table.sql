-- Create a table to store manually selected related content
CREATE TABLE IF NOT EXISTS related_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('app', 'game')),
  related_id UUID NOT NULL,
  related_type TEXT NOT NULL CHECK (related_type IN ('app', 'game')),
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint to prevent duplicate relations
  UNIQUE(content_id, content_type, related_id, related_type)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS related_content_content_idx ON related_content(content_id, content_type);
CREATE INDEX IF NOT EXISTS related_content_related_idx ON related_content(related_id, related_type);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_related_content_updated_at
BEFORE UPDATE ON related_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
