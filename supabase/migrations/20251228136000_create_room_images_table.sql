-- Create room_images table to allow multiple images per room
CREATE TABLE public.room_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  ordering INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrate existing rooms.image_url values into room_images
INSERT INTO public.room_images (room_id, url, is_primary, ordering)
SELECT id, image_url, true, 0 FROM public.rooms WHERE image_url IS NOT NULL;

-- Null out the old column to avoid duplication (keeps backwards compatibility if needed)
UPDATE public.rooms SET image_url = NULL WHERE image_url IS NOT NULL;
