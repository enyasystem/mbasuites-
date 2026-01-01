-- Migration: allow authenticated users to INSERT into storage.objects for guest_ids bucket
BEGIN;

-- Allow authenticated users to insert objects into the `guest_ids` storage bucket.
-- This lets uploads succeed while keeping the bucket private for reads.
CREATE POLICY allow_guest_ids_insert ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guest_ids' AND owner = auth.uid()
);

COMMIT;
