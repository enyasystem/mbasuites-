-- Create activity_logs table for tracking admin actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and staff can view activity logs
CREATE POLICY "Staff can view activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- System can insert activity logs (via service role)
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Function to get booking statistics
CREATE OR REPLACE FUNCTION public.get_booking_stats(
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_location_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  cancelled_bookings BIGINT,
  pending_bookings BIGINT,
  completed_bookings BIGINT,
  total_revenue NUMERIC,
  avg_booking_value NUMERIC,
  total_nights BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'confirmed')::BIGINT as confirmed_bookings,
    COUNT(*) FILTER (WHERE b.status = 'cancelled')::BIGINT as cancelled_bookings,
    COUNT(*) FILTER (WHERE b.status = 'pending')::BIGINT as pending_bookings,
    COUNT(*) FILTER (WHERE b.status = 'completed')::BIGINT as completed_bookings,
    COALESCE(SUM(b.total_amount) FILTER (WHERE b.status NOT IN ('cancelled')), 0) as total_revenue,
    COALESCE(AVG(b.total_amount) FILTER (WHERE b.status NOT IN ('cancelled')), 0) as avg_booking_value,
    COALESCE(SUM(b.check_out_date - b.check_in_date) FILTER (WHERE b.status NOT IN ('cancelled')), 0)::BIGINT as total_nights
  FROM public.bookings b
  LEFT JOIN public.rooms r ON b.room_id = r.id
  WHERE b.created_at::DATE >= p_start_date
    AND b.created_at::DATE <= p_end_date
    AND (p_location_id IS NULL OR r.location_id = p_location_id);
END;
$$;

-- Function to get occupancy rate
CREATE OR REPLACE FUNCTION public.get_occupancy_stats(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')::DATE,
  p_location_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_rooms BIGINT,
  occupied_room_nights BIGINT,
  total_room_nights BIGINT,
  occupancy_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_rooms BIGINT;
  v_days INTEGER;
  v_occupied BIGINT;
BEGIN
  v_days := p_end_date - p_start_date;
  
  -- Get total rooms
  SELECT COUNT(*) INTO v_total_rooms
  FROM public.rooms r
  WHERE r.is_available = true
    AND (p_location_id IS NULL OR r.location_id = p_location_id);
  
  -- Get occupied room nights
  SELECT COALESCE(SUM(
    LEAST(b.check_out_date, p_end_date) - GREATEST(b.check_in_date, p_start_date)
  ), 0) INTO v_occupied
  FROM public.bookings b
  LEFT JOIN public.rooms r ON b.room_id = r.id
  WHERE b.status NOT IN ('cancelled')
    AND b.check_in_date < p_end_date
    AND b.check_out_date > p_start_date
    AND (p_location_id IS NULL OR r.location_id = p_location_id);
  
  RETURN QUERY
  SELECT 
    v_total_rooms,
    v_occupied,
    (v_total_rooms * v_days)::BIGINT,
    CASE WHEN v_total_rooms * v_days > 0 
      THEN ROUND((v_occupied::NUMERIC / (v_total_rooms * v_days)) * 100, 2)
      ELSE 0 
    END;
END;
$$;

-- Function to get revenue by room type
CREATE OR REPLACE FUNCTION public.get_revenue_by_room_type(
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_location_id UUID DEFAULT NULL
)
RETURNS TABLE (
  room_type room_type,
  booking_count BIGINT,
  total_revenue NUMERIC,
  avg_revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.room_type,
    COUNT(b.id)::BIGINT as booking_count,
    COALESCE(SUM(b.total_amount), 0) as total_revenue,
    COALESCE(AVG(b.total_amount), 0) as avg_revenue
  FROM public.rooms r
  LEFT JOIN public.bookings b ON r.id = b.room_id 
    AND b.created_at::DATE >= p_start_date
    AND b.created_at::DATE <= p_end_date
    AND b.status NOT IN ('cancelled')
  WHERE (p_location_id IS NULL OR r.location_id = p_location_id)
  GROUP BY r.room_type
  ORDER BY total_revenue DESC;
END;
$$;

-- Function to get daily booking trends
CREATE OR REPLACE FUNCTION public.get_daily_booking_trends(
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_location_id UUID DEFAULT NULL
)
RETURNS TABLE (
  booking_date DATE,
  booking_count BIGINT,
  revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.created_at::DATE as booking_date,
    COUNT(*)::BIGINT as booking_count,
    COALESCE(SUM(b.total_amount), 0) as revenue
  FROM public.bookings b
  LEFT JOIN public.rooms r ON b.room_id = r.id
  WHERE b.created_at::DATE >= p_start_date
    AND b.created_at::DATE <= p_end_date
    AND b.status NOT IN ('cancelled')
    AND (p_location_id IS NULL OR r.location_id = p_location_id)
  GROUP BY b.created_at::DATE
  ORDER BY booking_date;
END;
$$;