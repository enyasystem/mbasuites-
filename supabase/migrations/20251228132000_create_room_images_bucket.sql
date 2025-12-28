-- Create a public storage bucket for room images
-- This creates a public bucket 'room-images' to host room photos

INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

-- Allow anyone to read objects in the bucket (optional; public buckets are generally readable)
CREATE POLICY "Anyone can view room images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'room-images');
