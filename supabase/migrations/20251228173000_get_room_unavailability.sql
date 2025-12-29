BEGIN;

-- Returns combined unavailability ranges for a room from bookings and blocked_dates
CREATE OR REPLACE FUNCTION public.get_room_unavailability(p_room_id UUID)
RETURNS TABLE(start_date date, end_date date, source text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Bookings (non-sensitive fields only)
  RETURN QUERY
  SELECT check_in_date::date, check_out_date::date, 'Direct Booking'::text
  FROM public.bookings
  WHERE room_id = p_room_id
    AND status NOT IN ('cancelled');

  -- External blocked dates
  RETURN QUERY
  SELECT start_date::date, end_date::date, COALESCE(summary, 'External Booking')::text
  FROM public.blocked_dates
  WHERE room_id = p_room_id;

END;
$$;

COMMIT;
