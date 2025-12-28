-- Seed MBA Suites rooms and accommodations
-- Run this SQL in your Supabase SQL editor or include as a migration
-- NOTE: These rooms are specifically for the Lagos location only.
-- Ensure the Lagos location exists (id: 8599d552-8c3a-45d8-99db-5651da5fdee6) before inserting rooms.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.locations WHERE id = '8599d552-8c3a-45d8-99db-5651da5fdee6') THEN
    INSERT INTO public.locations (id, name, country, city, address, currency, is_active)
    VALUES (
      '8599d552-8c3a-45d8-99db-5651da5fdee6',
      'MBA Suites Lagos',
      'Nigeria',
      'Lekki, Lagos',
      'Emcel Garden Estate, Orchid, Lekki, Lagos, Nigeria',
      'NGN',
      true
    );
  END IF;
END
$$;

INSERT INTO public.rooms (title, room_number, room_type, price_per_night, max_guests, description, amenities, image_url, is_available, location_id)
VALUES
-- Single rooms (Qty 5) - N40k
('Single Room 1', 'S-101', 'standard', 40000.00, 1, 'Cozy single room with comfortable single bed, ideal for solo travelers.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom-01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Single Room 2', 'S-102', 'standard', 40000.00, 1, 'Cozy single room with comfortable single bed, ideal for solo travelers.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-modern-decor_03.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Single Room 3', 'S-103', 'standard', 40000.00, 1, 'Cozy single room with comfortable single bed, ideal for solo travelers.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-modern-decor_04.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Single Room 4', 'S-104', 'standard', 40000.00, 1, 'Cozy single room with comfortable single bed, ideal for solo travelers.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-modern-decor_05.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Single Room 5', 'S-105', 'standard', 40000.00, 1, 'Cozy single room with comfortable single bed, ideal for solo travelers.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-modern-decor_06.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),

-- Queen size rooms (Qty 10) - N50k
('Queen Room 1', 'Q-201', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-side-angle_02.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 2', 'Q-202', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_master-wide-view_01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 3', 'Q-203', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_main-view_01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 4', 'Q-204', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room3.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 5', 'Q-205', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_coffee-table-view_06.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 6', 'Q-206', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_evening-lighting_04.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 7', 'Q-207', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_main-view_03.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 8', 'Q-208', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_002.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 9', 'Q-209', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-modern-decor_03.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Queen Room 10', 'Q-210', 'deluxe', 50000.00, 2, 'Spacious queen-sized room with modern amenities.', ARRAY['WiFi','Air Conditioning','En-suite Bathroom','Queen Bed'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_guest-modern-decor_04.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),

-- Master's suite (Qty 5) - N70k (has balcony)
('Master Suite 1', 'MS-301', 'suite', 70000.00, 3, 'Spacious master suite with private balcony and premium furnishings.', ARRAY['WiFi','Air Conditioning','King Bed','Private Balcony','En-suite Bathroom','Living Area'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_bedroom_master-wide-view_01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Master Suite 2', 'MS-302', 'suite', 70000.00, 3, 'Spacious master suite with private balcony and premium furnishings.', ARRAY['WiFi','Air Conditioning','King Bed','Private Balcony','En-suite Bathroom','Living Area'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_balcony-view-01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Master Suite 3', 'MS-303', 'suite', 70000.00, 3, 'Spacious master suite with private balcony and premium furnishings.', ARRAY['WiFi','Air Conditioning','King Bed','Private Balcony','En-suite Bathroom','Living Area'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_main-view_01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Master Suite 4', 'MS-304', 'suite', 70000.00, 3, 'Spacious master suite with private balcony and premium furnishings.', ARRAY['WiFi','Air Conditioning','King Bed','Private Balcony','En-suite Bathroom','Living Area'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_evening-lighting_04.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('Master Suite 5', 'MS-305', 'suite', 70000.00, 3, 'Spacious master suite with private balcony and premium furnishings.', ARRAY['WiFi','Air Conditioning','King Bed','Private Balcony','En-suite Bathroom','Living Area'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_003.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),

-- One bedroom apartments (Qty 2) - N80k
('One Bedroom Apt 1', 'A-401', 'suite', 80000.00, 3, 'One bedroom apartment with separate living room and kitchen.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_apartment-view_.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('One Bedroom Apt 2', 'A-402', 'suite', 80000.00, 3, 'One bedroom apartment with separate living room and kitchen.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','En-suite Bathroom'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),

-- 4 Bedrooms house (all ensuite) (Qty 5) - N200k
('4-Bed House 1', 'H4-501', 'suite', 200000.00, 8, 'Four bedroom house with ensuite bathrooms for all rooms, perfect for families or groups.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms','Outdoor Pool'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_pool_outdoor-view_01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('4-Bed House 2', 'H4-502', 'suite', 200000.00, 8, 'Four bedroom house with ensuite bathrooms for all rooms, perfect for families or groups.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms','Outdoor Pool'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_entertainment-area_05.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('4-Bed House 3', 'H4-503', 'suite', 200000.00, 8, 'Four bedroom house with ensuite bathrooms for all rooms, perfect for families or groups.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms','Outdoor Pool'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_sitting-room.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('4-Bed House 4', 'H4-504', 'suite', 200000.00, 8, 'Four bedroom house with ensuite bathrooms for all rooms, perfect for families or groups.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms','Outdoor Pool'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_sitting-01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('4-Bed House 5', 'H4-505', 'suite', 200000.00, 8, 'Four bedroom house with ensuite bathrooms for all rooms, perfect for families or groups.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms','Outdoor Pool'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_kitchen_modern-design_01.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),

-- 3 Bedrooms house (all ensuite) (Qty 5) - N180k
('3-Bed House 1', 'H3-601', 'suite', 180000.00, 6, 'Three bedroom house with ensuite bathrooms for all rooms, ideal for families.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_04.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('3-Bed House 2', 'H3-602', 'suite', 180000.00, 6, 'Three bedroom house with ensuite bathrooms for all rooms, ideal for families.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_06.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('3-Bed House 3', 'H3-603', 'suite', 180000.00, 6, 'Three bedroom house with ensuite bathrooms for all rooms, ideal for families.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_07.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('3-Bed House 4', 'H3-604', 'suite', 180000.00, 6, 'Three bedroom house with ensuite bathrooms for all rooms, ideal for families.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_09.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
('3-Bed House 5', 'H3-605', 'suite', 180000.00, 6, 'Three bedroom house with ensuite bathrooms for all rooms, ideal for families.', ARRAY['WiFi','Air Conditioning','Kitchen','Living Area','Ensuite Bathrooms'], 'https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/mba-suites_living-room_tv-wall_03.jpeg', true, '8599d552-8c3a-45d8-99db-5651da5fdee6');
