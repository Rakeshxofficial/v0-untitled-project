-- Create a table for custom sitemap entries
CREATE TABLE IF NOT EXISTS custom_sitemap_entries (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  priority DECIMAL(3,2) CHECK (priority >= 0.0 AND priority <= 1.0) DEFAULT 0.5,
  change_frequency TEXT CHECK (change_frequency IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')) DEFAULT 'weekly',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  include_in_sitemap BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Create a table for sitemap exclusions (URLs to exclude from automatic generation)
CREATE TABLE IF NOT EXISTS sitemap_exclusions (
  id SERIAL PRIMARY KEY,
  url_pattern TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_custom_sitemap_entries_updated_at
BEFORE UPDATE ON custom_sitemap_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
