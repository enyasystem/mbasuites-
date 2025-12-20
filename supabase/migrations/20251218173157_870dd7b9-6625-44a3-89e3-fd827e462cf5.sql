-- Drop the existing permissive insert policy
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

-- Create a new policy that only allows authenticated users to insert
CREATE POLICY "Authenticated users can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);