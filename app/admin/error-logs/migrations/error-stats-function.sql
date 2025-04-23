-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats()
RETURNS TABLE (
  severity TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  -- Get total count of errors
  SELECT COUNT(*) INTO total_count FROM error_logs;
  
  -- Return stats for each severity level
  RETURN QUERY
  SELECT 
    e.severity,
    COUNT(*) as count,
    CASE 
      WHEN total_count > 0 THEN (COUNT(*) * 100.0 / total_count)
      ELSE 0
    END as percentage
  FROM error_logs e
  GROUP BY e.severity
  ORDER BY 
    CASE 
      WHEN e.severity = 'critical' THEN 1
      WHEN e.severity = 'high' THEN 2
      WHEN e.severity = 'medium' THEN 3
      WHEN e.severity = 'low' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;
