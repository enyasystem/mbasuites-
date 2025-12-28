BEGIN;

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can SELECT reviews
DROP POLICY IF EXISTS "Public can select reviews" ON public.reviews;
CREATE POLICY "Public can select reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Authenticated users may INSERT reviews for themselves
DROP POLICY IF EXISTS "Authenticated users can insert their reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert their reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Users may update or delete their own reviews; admins may manage all
DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;
CREATE POLICY "Users can manage own reviews"
  ON public.reviews
  FOR ALL
  USING (
    user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

COMMIT;
