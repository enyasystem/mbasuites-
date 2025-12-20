-- Create function to check room availability (prevents double-booking)
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = p_room_id
      AND status NOT IN ('cancelled')
      AND id IS DISTINCT FROM p_exclude_booking_id
      AND (
        (check_in_date < p_check_out AND check_out_date > p_check_in)
      )
  );
END;
$$;

-- Create function to get unavailable dates for a room
CREATE OR REPLACE FUNCTION public.get_room_unavailable_dates(
  p_room_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '90 days'
)
RETURNS TABLE(
  check_in_date DATE,
  check_out_date DATE,
  booking_id UUID,
  source TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.check_in_date,
    b.check_out_date,
    b.id as booking_id,
    COALESCE(b.notes, 'direct') as source
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.status NOT IN ('cancelled')
    AND b.check_out_date >= p_start_date
    AND b.check_in_date <= p_end_date
  ORDER BY b.check_in_date;
END;
$$;

-- Create trigger to validate booking before insert/update
CREATE OR REPLACE FUNCTION public.validate_booking_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_room_availability(
    NEW.room_id, 
    NEW.check_in_date, 
    NEW.check_out_date,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Room is not available for the selected dates';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_booking_availability
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_availability();

-- Create table for external calendar syncs (Booking.com, Airbnb, etc.)
CREATE TABLE public.external_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'booking.com', 'airbnb', 'other'
  ical_url TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on external_calendars
ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;

-- Only staff/admin can manage external calendars
CREATE POLICY "Staff can view external calendars"
  ON public.external_calendars
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can manage external calendars"
  ON public.external_calendars
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Create table for blocked dates from external sources
CREATE TABLE public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  external_calendar_id UUID REFERENCES public.external_calendars(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  external_id TEXT, -- UID from iCal
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blocked_dates
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Anyone can view blocked dates for availability
CREATE POLICY "Anyone can view blocked dates"
  ON public.blocked_dates
  FOR SELECT
  USING (true);

-- Only system can manage blocked dates
CREATE POLICY "Staff can manage blocked dates"
  ON public.blocked_dates
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Update availability check to include blocked dates
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check internal bookings
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = p_room_id
      AND status NOT IN ('cancelled')
      AND id IS DISTINCT FROM p_exclude_booking_id
      AND (check_in_date < p_check_out AND check_out_date > p_check_in)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check external blocked dates
  IF EXISTS (
    SELECT 1 FROM public.blocked_dates
    WHERE room_id = p_room_id
      AND (start_date < p_check_out AND end_date > p_check_in)
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Add indexes for performance
CREATE INDEX idx_bookings_room_dates ON public.bookings(room_id, check_in_date, check_out_date);
CREATE INDEX idx_blocked_dates_room ON public.blocked_dates(room_id, start_date, end_date);
CREATE INDEX idx_external_calendars_room ON public.external_calendars(room_id);

-- Add trigger for updated_at on external_calendars
CREATE TRIGGER update_external_calendars_updated_at
  BEFORE UPDATE ON public.external_calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();