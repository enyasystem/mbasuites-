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
  SELECT b.check_in_date::date, b.check_out_date::date, 'Direct Booking'::text
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.status NOT IN ('cancelled');

  -- External blocked dates
  RETURN QUERY
  SELECT bd.start_date::date, bd.end_date::date, COALESCE(bd.summary, 'External Booking')::text
  FROM public.blocked_dates bd
  WHERE bd.room_id = p_room_id;

END;
$$;

COMMIT;
