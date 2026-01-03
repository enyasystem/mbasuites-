-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  promo_code TEXT UNIQUE,
  image_url TEXT,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  display_locations TEXT[] DEFAULT '{banner,offers,rooms}', -- where to show: banner, offers, rooms
  applicable_room_types TEXT[] DEFAULT '{}', -- empty = all rooms
  applicable_location_ids UUID[] DEFAULT '{}', -- empty = all locations
  min_nights INTEGER DEFAULT 1,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active promotions (example policy; adjust to your auth functions)
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (is_active = true);

-- Admins can manage promotions (placeholder - adjust to your role helper)
CREATE POLICY "Admins can manage promotions"
ON public.promotions
FOR ALL
USING (true);

-- Trigger for updated_at - assumes public.handle_updated_at() exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    CREATE TRIGGER handle_updated_at_promotions
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- Sample promotions
INSERT INTO public.promotions (title, description, discount_type, discount_value, promo_code, display_locations, start_date, end_date)
VALUES 
  ('New Year Special', 'Start 2025 right! Get 20% off all suites', 'percentage', 20, 'NEWYEAR25', '{banner,offers,rooms}', now(), now() + interval '30 days'),
  ('Weekend Getaway', 'Book 2+ nights on weekends and save 15%', 'percentage', 15, 'WEEKEND15', '{offers,rooms}', now(), now() + interval '60 days'),
  ('Early Bird Discount', 'Book 30 days in advance and save 25%', 'percentage', 25, NULL, '{offers}', now(), now() + interval '90 days');
