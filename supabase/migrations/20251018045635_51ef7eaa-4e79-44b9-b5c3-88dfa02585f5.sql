-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_destinations_user_id ON public.user_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_destinations_destination_id ON public.user_destinations(destination_id);
CREATE INDEX IF NOT EXISTS idx_user_destinations_is_active ON public.user_destinations(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_price_history_destination_id ON public.price_history(destination_id);
CREATE INDEX IF NOT EXISTS idx_price_history_checked_at ON public.price_history(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_destination_date ON public.price_history(destination_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_destination_id ON public.price_alerts(destination_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_received_at ON public.price_alerts(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON public.email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_destinations_is_active ON public.destinations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_destinations_airport_code ON public.destinations(airport_code);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_is_verified ON public.subscribers(is_verified) WHERE is_verified = true;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Add rate limiting table for API endpoints
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint, window_start);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Admin can view rate limits
CREATE POLICY "Admins can view rate limits" ON public.rate_limits
  FOR SELECT USING (is_admin(auth.uid()));

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests integer DEFAULT 60,
  p_window_minutes integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamp with time zone;
  v_request_count integer;
BEGIN
  -- Calculate window start time (round down to the minute)
  v_window_start := date_trunc('minute', now()) - ((EXTRACT(minute FROM now())::integer % p_window_minutes) || ' minutes')::interval;
  
  -- Get current request count for this window
  SELECT request_count INTO v_request_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start = v_window_start;
  
  -- If no record exists, create one
  IF v_request_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_start)
    VALUES (p_identifier, p_endpoint, 1, v_window_start);
    RETURN true;
  END IF;
  
  -- If under limit, increment counter
  IF v_request_count < p_max_requests THEN
    UPDATE public.rate_limits
    SET request_count = request_count + 1
    WHERE identifier = p_identifier
      AND endpoint = p_endpoint
      AND window_start = v_window_start;
    RETURN true;
  END IF;
  
  -- Over limit
  RETURN false;
END;
$$;

-- Function to clean up old rate limit records (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;

-- Add password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token) WHERE used = false;
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at) WHERE used = false;

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Function to create password reset token
CREATE OR REPLACE FUNCTION public.create_password_reset_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  -- Generate random token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert token (expires in 1 hour)
  INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
  VALUES (p_user_id, v_token, now() + INTERVAL '1 hour');
  
  RETURN v_token;
END;
$$;