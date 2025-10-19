-- Add new columns to user_destinations for alert preferences
ALTER TABLE public.user_destinations
ADD COLUMN IF NOT EXISTS min_deal_quality text DEFAULT 'good' CHECK (min_deal_quality IN ('any', 'good', 'great', 'excellent', 'exceptional')),
ADD COLUMN IF NOT EXISTS alert_frequency text DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
ADD COLUMN IF NOT EXISTS min_price_drop_percent numeric DEFAULT 5.0;

-- Add new columns to user_preferences for global alert settings
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS quiet_hours_start integer DEFAULT 22 CHECK (quiet_hours_start >= 0 AND quiet_hours_start <= 23),
ADD COLUMN IF NOT EXISTS quiet_hours_end integer DEFAULT 8 CHECK (quiet_hours_end >= 0 AND quiet_hours_end <= 23),
ADD COLUMN IF NOT EXISTS max_alerts_per_week integer DEFAULT 10;

-- Add new columns to price_alerts for enhanced tracking
ALTER TABLE public.price_alerts
ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS triggered_price numeric,
ADD COLUMN IF NOT EXISTS threshold_price numeric,
ADD COLUMN IF NOT EXISTS outbound_date date,
ADD COLUMN IF NOT EXISTS return_date date;

-- Update refresh_price_statistics function to calculate current percentile
CREATE OR REPLACE FUNCTION public.refresh_price_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert or update statistics for each destination
  INSERT INTO public.price_statistics (
    destination_id,
    avg_7day,
    avg_30day,
    avg_90day,
    all_time_low,
    all_time_high,
    percentile_25,
    percentile_50,
    percentile_75,
    std_deviation,
    total_samples,
    last_calculated
  )
  SELECT 
    d.id as destination_id,
    (SELECT AVG(price) FROM public.price_history 
     WHERE destination_id = d.id 
     AND checked_at >= NOW() - INTERVAL '7 days') as avg_7day,
    (SELECT AVG(price) FROM public.price_history 
     WHERE destination_id = d.id 
     AND checked_at >= NOW() - INTERVAL '30 days') as avg_30day,
    (SELECT AVG(price) FROM public.price_history 
     WHERE destination_id = d.id 
     AND checked_at >= NOW() - INTERVAL '90 days') as avg_90day,
    (SELECT MIN(price) FROM public.price_history 
     WHERE destination_id = d.id) as all_time_low,
    (SELECT MAX(price) FROM public.price_history 
     WHERE destination_id = d.id) as all_time_high,
    (SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY price) 
     FROM public.price_history WHERE destination_id = d.id) as percentile_25,
    (SELECT PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY price) 
     FROM public.price_history WHERE destination_id = d.id) as percentile_50,
    (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY price) 
     FROM public.price_history WHERE destination_id = d.id) as percentile_75,
    (SELECT STDDEV(price) FROM public.price_history 
     WHERE destination_id = d.id) as std_deviation,
    (SELECT COUNT(*) FROM public.price_history 
     WHERE destination_id = d.id) as total_samples,
    NOW() as last_calculated
  FROM public.destinations d
  WHERE d.is_active = true
  ON CONFLICT (destination_id) 
  DO UPDATE SET
    avg_7day = EXCLUDED.avg_7day,
    avg_30day = EXCLUDED.avg_30day,
    avg_90day = EXCLUDED.avg_90day,
    all_time_low = EXCLUDED.all_time_low,
    all_time_high = EXCLUDED.all_time_high,
    percentile_25 = EXCLUDED.percentile_25,
    percentile_50 = EXCLUDED.percentile_50,
    percentile_75 = EXCLUDED.percentile_75,
    std_deviation = EXCLUDED.std_deviation,
    total_samples = EXCLUDED.total_samples,
    last_calculated = EXCLUDED.last_calculated;
END;
$function$;

-- Create admin_settings entries for alert configuration
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
  ('alert_min_quality', '"good"'::jsonb, 'Minimum deal quality to send alerts (any, good, great, excellent, exceptional)'),
  ('alert_default_cooldown', '7'::jsonb, 'Default cooldown period in days between alerts'),
  ('alert_max_per_week', '10'::jsonb, 'Maximum alerts per user per week'),
  ('alert_min_price_drop', '5'::jsonb, 'Minimum price drop percentage to trigger alert'),
  ('alert_min_history_days', '30'::jsonb, 'Minimum days of price history required before alerting')
ON CONFLICT (setting_key) DO NOTHING;