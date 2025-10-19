-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule check-flight-prices to run every 6 hours
SELECT cron.schedule(
  'check-flight-prices-job',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://nlrdiznleytpuwvugloi.supabase.co/functions/v1/check-flight-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmRpem5sZXl0cHV3dnVnbG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQzOTUsImV4cCI6MjA3NTM1MDM5NX0.H69iAvi4PyvauoOOD4wLinEhiNUTEkO3jmwL-aEAFF8"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule process-email-queue to run every 5 minutes
SELECT cron.schedule(
  'process-email-queue-job',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://nlrdiznleytpuwvugloi.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmRpem5sZXl0cHV3dnVnbG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQzOTUsImV4cCI6MjA3NTM1MDM5NX0.H69iAvi4PyvauoOOD4wLinEhiNUTEkO3jmwL-aEAFF8"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);