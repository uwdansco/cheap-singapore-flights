-- Allow authenticated users to add new destinations
CREATE POLICY "Authenticated users can add destinations"
ON public.destinations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);