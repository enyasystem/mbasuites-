-- Insert a temporary booking for testing iCal export
-- Usage: run this against the active Supabase project where functions are deployed.
-- e.g. supabase db query --project-ref <project-ref> < supabase/sql/insert_test_booking.sql

-- IMPORTANT: this creates a booking row and prints the generated id.
-- After testing, run the cleanup SQL below to remove the row.

BEGIN;

-- Adjust these variables if needed
-- Room id for Single Room 3
WITH params AS (
  SELECT
    'aefbf0ed-d8bf-46ef-b4af-338c223b94a3'::uuid AS room_id,
    -- Replace this with a real user id from your `profiles` or `auth.users` table if available.
    -- If your DB enforces a foreign key to `auth.users`, set this to a valid user UUID before running.
    '00000000-0000-0000-0000-000000000000'::uuid AS user_id,
    '2025-12-30'::date AS check_in,
    '2025-12-31'::date AS check_out,
    'Bill Hayman'::text AS guest_name,
    'Catherineluiz22@gmail.com'::text AS guest_email,
    '09134087675'::text AS guest_phone,
    40000::numeric AS total_amount
)

INSERT INTO bookings (
  user_id,
  room_id,
  check_in_date,
  check_out_date,
  num_guests,
  total_amount,
  status,
  guest_name,
  guest_email,
  guest_phone,
  currency,
  created_at
)
SELECT
  user_id,
  room_id,
  check_in,
  check_out,
  1 AS num_guests,
  total_amount,
  'confirmed'::booking_status AS status,
  guest_name,
  guest_email,
  guest_phone,
  'NGN'::text AS currency,
  now() AT TIME ZONE 'UTC'
FROM params
RETURNING id;

COMMIT;

-- Cleanup (run after testing): replace <id> with the returned id
-- DELETE FROM bookings WHERE id = '<id>'::uuid;
