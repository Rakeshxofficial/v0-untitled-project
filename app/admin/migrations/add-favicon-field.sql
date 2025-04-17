-- Add favicon_url column to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Add favicon_url column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS favicon_url TEXT;
