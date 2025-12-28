-- Update any existing room image_url values that reference the old public folder
-- This replaces occurrences of the encoded public path with the `room-images/` bucket path

UPDATE public.rooms
SET image_url = regexp_replace(image_url, '/mba%20suites%20pictures/', 'room-images/')
WHERE image_url LIKE '/mba%20suites%20pictures/%';

-- Optionally, if some rows used unencoded spaces (unlikely), also update those:
UPDATE public.rooms
SET image_url = regexp_replace(image_url, 'mba suites pictures/', 'room-images/')
WHERE image_url LIKE '%mba suites pictures/%';
