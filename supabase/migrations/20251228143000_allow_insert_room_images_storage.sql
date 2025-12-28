BEGIN;

-- Allow admins/staff to upload files to the room-images bucket
DROP POLICY IF EXISTS "Users can upload room images" ON storage.objects;
CREATE POLICY "Users can upload room images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'room-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);

COMMIT;
