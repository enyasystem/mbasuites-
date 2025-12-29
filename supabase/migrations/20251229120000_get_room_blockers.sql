BEGIN;

-- Returns booking and blocked_date ranges that block a given date range for a room
CREATE OR REPLACE FUNCTION public.get_room_blockers(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS TABLE(start_date date, end_date date, source text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Bookings that overlap the requested range
  RETURN QUERY
  SELECT check_in_date::date, check_out_date::date, 'Direct Booking'::text
  FROM public.bookings
  WHERE room_id = p_room_id
    AND status NOT IN ('cancelled')
    AND check_in_date < p_check_out
    AND check_out_date > p_check_in;

  -- External blocked dates that overlap the requested range
  RETURN QUERY
  SELECT start_date::date, end_date::date, COALESCE(summary, 'External Booking')::text
  FROM public.blocked_dates
  WHERE room_id = p_room_id
    AND start_date < p_check_out
    AND end_date > p_check_in;
END;
$$;

COMMIT;
