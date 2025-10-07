-- Allow public access to view price alerts and destinations
CREATE POLICY "Anyone can view price alerts"
ON public.price_alerts
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view destinations"
ON public.destinations
FOR SELECT
USING (true);