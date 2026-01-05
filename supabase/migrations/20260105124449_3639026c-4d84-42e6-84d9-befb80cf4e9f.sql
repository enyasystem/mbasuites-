-- Create storage bucket for room media
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-media', 'room-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to room-media bucket
CREATE POLICY "Staff can upload room media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-media' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);

-- Allow anyone to view room media (public bucket)
CREATE POLICY "Anyone can view room media"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-media');

-- Allow staff to delete room media
CREATE POLICY "Staff can delete room media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-media' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);
