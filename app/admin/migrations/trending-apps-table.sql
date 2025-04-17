-- Create trending_apps table
CREATE TABLE IF NOT EXISTS trending_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on position for faster sorting
CREATE INDEX IF NOT EXISTS trending_apps_position_idx ON trending_apps(position);

-- Create index on app_id for faster lookups
CREATE INDEX IF NOT EXISTS trending_apps_app_id_idx ON trending_apps(app_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_trending_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trending_apps_updated_at
BEFORE UPDATE ON trending_apps
FOR EACH ROW
EXECUTE FUNCTION update_trending_apps_updated_at();
