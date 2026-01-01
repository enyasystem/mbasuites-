-- Migration: allow owners and staff/admin to SELECT objects in guest_ids storage bucket
BEGIN;

-- Allow owners and staff/admin users to SELECT objects from the `guest_ids` storage bucket.
-- This is required so the app can create signed URLs for private buckets.
CREATE POLICY allow_guest_ids_select ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'guest_ids' AND (
    owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','staff')
    )
  )
);

COMMIT;
