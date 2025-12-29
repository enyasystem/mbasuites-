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
  SELECT b.check_in_date::date, b.check_out_date::date, 'Direct Booking'::text
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.status NOT IN ('cancelled')
    AND b.check_in_date < p_check_out
    AND b.check_out_date > p_check_in;

  -- External blocked dates that overlap the requested range
  RETURN QUERY
  SELECT bd.start_date::date, bd.end_date::date, COALESCE(bd.summary, 'External Booking')::text
  FROM public.blocked_dates bd
  WHERE bd.room_id = p_room_id
    AND bd.start_date < p_check_out
    AND bd.end_date > p_check_in;
END;
$$;

COMMIT;
