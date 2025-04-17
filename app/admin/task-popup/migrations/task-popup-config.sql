-- Create task_popup_config table
CREATE TABLE IF NOT EXISTS task_popup_config (
  id TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  buttons JSONB DEFAULT '[]'::jsonb,
  target_apps TEXT[] DEFAULT NULL,
  remember_completion BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO task_popup_config (id, enabled, buttons, target_apps, remember_completion)
VALUES (
  'task-popup-config',
  false,
  '[
    {
      "id": "button-1",
      "label": "Join Telegram",
      "url": "https://t.me/example",
      "icon": "telegram"
    },
    {
      "id": "button-2",
      "label": "Follow on Instagram",
      "url": "https://instagram.com/example",
      "icon": "instagram"
    },
    {
      "id": "button-3",
      "label": "Subscribe on YouTube",
      "url": "https://youtube.com/example",
      "icon": "youtube"
    }
  ]'::jsonb,
  NULL,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_task_popup_config_updated_at
BEFORE UPDATE ON task_popup_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
