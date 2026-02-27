-- Migration: Expand site map with new locations and properties
-- Created: 2026-02-27
-- Description: Add Emcel Garden Estate, Applewood Estate, Sugar Hills for Lagos;
--              GRA for Enugu; and Guest studio for Nakuru

-- ================================================================
-- Part 1: Insert new locations
-- ================================================================

-- Emcel Garden Estate Lekki, Lagos
INSERT INTO public.locations (name, country, city, address, currency, is_active)
VALUES (
  'Emcel Garden Estate Lekki',
  'Nigeria',
  'Lekki, Lagos',
  'Emcel Garden Estate, Lekki, Lagos, Nigeria',
  'NGN',
  true
) ON CONFLICT DO NOTHING;

-- Applewood Estate Lekki, Lagos
INSERT INTO public.locations (name, country, city, address, currency, is_active)
VALUES (
  'Applewood Estate Lekki',
  'Nigeria',
  'Lekki, Lagos',
  'Applewood Estate, Lekki, Lagos, Nigeria',
  'NGN',
  true
) ON CONFLICT DO NOTHING;

-- Sugar Hills Apartment Ologolo Lekki, Lagos
INSERT INTO public.locations (name, country, city, address, currency, is_active)
VALUES (
  'Sugar Hills Apartment Ologolo Lekki',
  'Nigeria',
  'Lekki, Lagos',
  'Ologolo, Lekki, Lagos, Nigeria',
  'NGN',
  true
) ON CONFLICT DO NOTHING;

-- GRA, Enugu
INSERT INTO public.locations (name, country, city, address, currency, is_active)
VALUES (
  'GRA Enugu',
  'Nigeria',
  'Enugu',
  'GRA, Enugu, Nigeria',
  'NGN',
  true
) ON CONFLICT DO NOTHING;

-- Guest Studio, Nakuru, Kenya
INSERT INTO public.locations (name, country, city, address, currency, is_active)
VALUES (
  'Guest Studio Nakuru',
  'Kenya',
  'Nakuru',
  'Nakuru City, Kenya',
  'KES',
  true
) ON CONFLICT DO NOTHING;

-- ================================================================
-- Part 2: Insert rooms for Emcel Garden Estate Lekki
-- ================================================================

DO $$
DECLARE
  emcel_location_id UUID;
BEGIN
  SELECT id INTO emcel_location_id FROM public.locations WHERE name = 'Emcel Garden Estate Lekki';
  
  IF emcel_location_id IS NOT NULL THEN
    -- Single Room suite (shared apartment - downstairs)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Single Room Suite - Downstairs', 'EGEL-SR-001', 'standard', 40000.00, 1, 'Single room suite in shared apartment (downstairs)', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], true, emcel_location_id) ON CONFLICT DO NOTHING;

    -- Queen suite (shared apartment - upstairs)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Queen Suite - Upstairs', 'EGEL-Q-001', 'deluxe', 50000.00, 2, 'Queen suite in shared apartment (upstairs)', ARRAY['WiFi','Air Conditioning','Queen Bed','En-suite Bathroom'], true, emcel_location_id) ON CONFLICT DO NOTHING;

    -- Master's suite (shared apartment - upstairs)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Master Suite - Upstairs', 'EGEL-MS-001', 'suite', 70000.00, 3, 'Master suite in shared apartment (upstairs)', ARRAY['WiFi','Air Conditioning','King Bed','En-suite Bathroom','Living Area'], true, emcel_location_id) ON CONFLICT DO NOTHING;

    -- One bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('One Bedroom Suite', 'EGEL-1BR-001', 'suite', 80000.00, 3, 'One bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','En-suite Bathroom'], true, emcel_location_id) ON CONFLICT DO NOTHING;

    -- Two bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Two Bedroom Suite', 'EGEL-2BR-001', 'suite', 120000.00, 5, 'Two bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], true, emcel_location_id) ON CONFLICT DO NOTHING;

    -- Three bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Three Bedroom Suite', 'EGEL-3BR-001', 'suite', 160000.00, 6, 'Three bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], true, emcel_location_id) ON CONFLICT DO NOTHING;

    -- Four bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Four Bedroom Suite', 'EGEL-4BR-001', 'suite', 200000.00, 8, 'Four bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], true, emcel_location_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================================
-- Part 3: Insert rooms for Applewood Estate Lekki
-- ================================================================

DO $$
DECLARE
  applewood_location_id UUID;
BEGIN
  SELECT id INTO applewood_location_id FROM public.locations WHERE name = 'Applewood Estate Lekki';
  
  IF applewood_location_id IS NOT NULL THEN
    -- Single Room suite (shared apartment - downstairs)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Single Room Suite - Downstairs', 'AEL-SR-001', 'standard', 40000.00, 1, 'Single room suite in shared apartment (downstairs)', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], true, applewood_location_id) ON CONFLICT DO NOTHING;

    -- Queen suite (shared apartment - upstairs)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Queen Suite - Upstairs', 'AEL-Q-001', 'deluxe', 50000.00, 2, 'Queen suite in shared apartment (upstairs)', ARRAY['WiFi','Air Conditioning','Queen Bed','En-suite Bathroom'], true, applewood_location_id) ON CONFLICT DO NOTHING;

    -- Master's suite (shared apartment - upstairs)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Master Suite - Upstairs', 'AEL-MS-001', 'suite', 70000.00, 3, 'Master suite in shared apartment (upstairs)', ARRAY['WiFi','Air Conditioning','King Bed','En-suite Bathroom','Living Area'], true, applewood_location_id) ON CONFLICT DO NOTHING;

    -- One bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('One Bedroom Suite', 'AEL-1BR-001', 'suite', 80000.00, 3, 'One bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','En-suite Bathroom'], true, applewood_location_id) ON CONFLICT DO NOTHING;

    -- Two bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Two Bedroom Suite', 'AEL-2BR-001', 'suite', 120000.00, 5, 'Two bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], true, applewood_location_id) ON CONFLICT DO NOTHING;

    -- Three bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Three Bedroom Suite', 'AEL-3BR-001', 'suite', 160000.00, 6, 'Three bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], true, applewood_location_id) ON CONFLICT DO NOTHING;

    -- Four bedroom suite (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Four Bedroom Suite', 'AEL-4BR-001', 'suite', 200000.00, 8, 'Four bedroom suite - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], true, applewood_location_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================================
-- Part 4: Insert rooms for Sugar Hills Apartment Ologolo Lekki
-- ================================================================

DO $$
DECLARE
  sugar_hills_location_id UUID;
BEGIN
  SELECT id INTO sugar_hills_location_id FROM public.locations WHERE name = 'Sugar Hills Apartment Ologolo Lekki';
  
  IF sugar_hills_location_id IS NOT NULL THEN
    -- One bedroom apartment (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('One Bedroom Apartment', 'SH-1BR-001', 'suite', 80000.00, 3, 'One bedroom apartment - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','En-suite Bathroom'], true, sugar_hills_location_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================================
-- Part 5: Insert rooms for GRA, Enugu
-- ================================================================

DO $$
DECLARE
  enugu_location_id UUID;
BEGIN
  SELECT id INTO enugu_location_id FROM public.locations WHERE name = 'GRA Enugu';
  
  IF enugu_location_id IS NOT NULL THEN
    -- 1 Bedroom apartment (entire apartment)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('1 Bedroom Apartment', 'GRA-1BR-001', 'suite', 50000.00, 3, '1 bedroom apartment - entire apartment', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','En-suite Bathroom'], true, enugu_location_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================================
-- Part 6: Insert rooms for Guest Studio, Nakuru, Kenya
-- ================================================================

DO $$
DECLARE
  nakuru_location_id UUID;
BEGIN
  SELECT id INTO nakuru_location_id FROM public.locations WHERE name = 'Guest Studio Nakuru';
  
  IF nakuru_location_id IS NOT NULL THEN
    -- Guest studio (entire studio)
    INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, is_available, location_id)
    VALUES ('Guest Studio', 'NK-STUDIO-001', 'standard', 100.00, 2, 'Guest studio - entire studio', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Kitchenette'], true, nakuru_location_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================================
-- Part 7: Summary
-- ================================================================

-- This migration adds:
-- 1. Emcel Garden Estate Lekki - 7 room types
-- 2. Applewood Estate Lekki - 7 room types  
-- 3. Sugar Hills Apartment Ologolo Lekki - 1 room type
-- 4. GRA Enugu - 1 room type
-- 5. Guest Studio Nakuru - 1 studio type
-- 
-- Total: 5 new locations and 17 new room listings
