-- Convert any existing 'room-images/<filename>' image_url values into full public URLs
-- This is safe to run once your images are uploaded to the `room-images` bucket

UPDATE public.rooms
SET image_url = regexp_replace(image_url, '^room-images/(.*)$', 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/\\1')
WHERE image_url LIKE 'room-images/%' AND image_url NOT LIKE 'https://%';
