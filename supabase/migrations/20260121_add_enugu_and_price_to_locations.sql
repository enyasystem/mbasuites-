-- Migration: Add location price column and seed Enugu location
-- Run via Supabase SQL editor or psql

-- Add price_per_night_usd column to locations
ALTER TABLE IF EXISTS public.locations
  ADD COLUMN IF NOT EXISTS price_per_night_usd numeric(10,2);

-- Insert Enugu location if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.locations WHERE name = 'Enugu' OR (city = 'Enugu' AND address = '2 Bent Lane, GRA Enugu')
  ) THEN
    INSERT INTO public.locations (name, country, city, address, currency, price_per_night_usd)
    VALUES ('Enugu', 'Nigeria', 'Enugu', '2 Bent Lane, GRA Enugu', 'USD', 50.00);
  END IF;
END$$;

-- No further action required; locations RLS policies already handle visibility.
