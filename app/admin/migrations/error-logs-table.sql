-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  stack TEXT,
  component_name TEXT,
  url TEXT,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  additional_data JSONB,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON error_logs (timestamp);

-- Create index on severity for filtering
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON error_logs (severity);

-- Create index on is_resolved for filtering
CREATE INDEX IF NOT EXISTS error_logs_is_resolved_idx ON error_logs (is_resolved);
