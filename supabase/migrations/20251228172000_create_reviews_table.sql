BEGIN;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid,
  user_name text NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Index for room lookup
CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON public.reviews(room_id);

COMMIT;
