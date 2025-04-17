-- Create publishers table if it doesn't exist
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add publisher column to blogs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'blogs' AND column_name = 'publisher'
  ) THEN
    ALTER TABLE blogs ADD COLUMN publisher VARCHAR(255);
  END IF;
END $$;

-- Add read_time column to blogs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'blogs' AND column_name = 'read_time'
  ) THEN
    ALTER TABLE blogs ADD COLUMN read_time INTEGER DEFAULT 5;
  END IF;
END $$;

-- Create index on publisher column
CREATE INDEX IF NOT EXISTS idx_blogs_publisher ON blogs(publisher);
