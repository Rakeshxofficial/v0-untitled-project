-- Add icon_bg_color column to apps table
ALTER TABLE apps
ADD COLUMN icon_bg_color VARCHAR(20);

-- Add icon_bg_color column to games table
ALTER TABLE games
ADD COLUMN icon_bg_color VARCHAR(20);

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN apps.icon_bg_color IS 'Background color for app icon in hex format (e.g. #3E3E3E)';
COMMENT ON COLUMN games.icon_bg_color IS 'Background color for game icon in hex format (e.g. #3E3E3E)';
