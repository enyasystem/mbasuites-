-- =====================================================
-- MBA SUITES DATABASE EXPORT
-- Run this in your new Supabase SQL Editor
-- =====================================================

-- 1. CREATE ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'guest');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.room_type AS ENUM ('standard', 'deluxe', 'suite');

-- 2. CREATE TABLES
-- =====================================================

-- Locations table
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  address text,
  phone text,
  email text,
  timezone text DEFAULT 'UTC',
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  room_number text NOT NULL,
  room_type public.room_type NOT NULL,
  price_per_night numeric NOT NULL,
  max_guests integer NOT NULL DEFAULT 2,
  description text,
  amenities text[] DEFAULT '{}'::text[],
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  location_id uuid REFERENCES public.locations(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'guest',
  location_id uuid REFERENCES public.locations(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  room_id uuid NOT NULL REFERENCES public.rooms(id),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  num_guests integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status public.booking_status NOT NULL DEFAULT 'pending',
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- External calendars table
CREATE TABLE public.external_calendars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id),
  platform text NOT NULL,
  ical_url text NOT NULL,
  last_synced_at timestamp with time zone,
  sync_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Blocked dates table
CREATE TABLE public.blocked_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id),
  external_calendar_id uuid REFERENCES public.external_calendars(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  external_id text,
  summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Payment settings table
CREATE TABLE public.payment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL,
  setting_value text,
  is_encrypted boolean DEFAULT false,
  location_id uuid REFERENCES public.locations(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Bank payment requests table
CREATE TABLE public.bank_payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_reference text,
  proof_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. CREATE FUNCTIONS
-- =====================================================

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- handle_new_user function (trigger for new users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'guest');
  
  RETURN NEW;
END;
$$;

-- handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- check_room_availability function
CREATE OR REPLACE FUNCTION public.check_room_availability(p_room_id uuid, p_check_in date, p_check_out date, p_exclude_booking_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = p_room_id
      AND status NOT IN ('cancelled')
      AND id IS DISTINCT FROM p_exclude_booking_id
      AND (check_in_date < p_check_out AND check_out_date > p_check_in)
  ) THEN
    RETURN FALSE;
  END IF;
  
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

-- validate_booking_availability function
CREATE OR REPLACE FUNCTION public.validate_booking_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- get_room_unavailable_dates function
CREATE OR REPLACE FUNCTION public.get_room_unavailable_dates(p_room_id uuid, p_start_date date DEFAULT CURRENT_DATE, p_end_date date DEFAULT (CURRENT_DATE + '90 days'::interval))
RETURNS TABLE(check_in_date date, check_out_date date, booking_id uuid, source text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- get_booking_stats function
CREATE OR REPLACE FUNCTION public.get_booking_stats(p_start_date date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, p_end_date date DEFAULT CURRENT_DATE, p_location_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(total_bookings bigint, confirmed_bookings bigint, cancelled_bookings bigint, pending_bookings bigint, completed_bookings bigint, total_revenue numeric, avg_booking_value numeric, total_nights bigint)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- get_occupancy_stats function
CREATE OR REPLACE FUNCTION public.get_occupancy_stats(p_start_date date DEFAULT CURRENT_DATE, p_end_date date DEFAULT ((CURRENT_DATE + '30 days'::interval))::date, p_location_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(total_rooms bigint, occupied_room_nights bigint, total_room_nights bigint, occupancy_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total_rooms BIGINT;
  v_days INTEGER;
  v_occupied BIGINT;
BEGIN
  v_days := p_end_date - p_start_date;
  
  SELECT COUNT(*) INTO v_total_rooms
  FROM public.rooms r
  WHERE r.is_available = true
    AND (p_location_id IS NULL OR r.location_id = p_location_id);
  
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

-- get_revenue_by_room_type function
CREATE OR REPLACE FUNCTION public.get_revenue_by_room_type(p_start_date date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, p_end_date date DEFAULT CURRENT_DATE, p_location_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(room_type room_type, booking_count bigint, total_revenue numeric, avg_revenue numeric)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- get_daily_booking_trends function
CREATE OR REPLACE FUNCTION public.get_daily_booking_trends(p_start_date date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, p_end_date date DEFAULT CURRENT_DATE, p_location_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(booking_date date, booking_count bigint, revenue numeric)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- 4. CREATE TRIGGERS
-- =====================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at triggers
CREATE TRIGGER handle_updated_at_locations BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_rooms BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_external_calendars BEFORE UPDATE ON public.external_calendars FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_payment_settings BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_bank_payment_requests BEFORE UPDATE ON public.bank_payment_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Booking availability validation trigger
CREATE TRIGGER validate_booking_availability_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_availability();

-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_payment_requests ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- =====================================================

-- Locations policies
CREATE POLICY "Anyone can view active locations" ON public.locations FOR SELECT USING ((is_active = true) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Rooms policies
CREATE POLICY "Anyone can view available rooms" ON public.rooms FOR SELECT USING ((is_available = true) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can insert rooms" ON public.rooms FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR (has_role(auth.uid(), 'staff') AND (location_id IN (SELECT ur.location_id FROM user_roles ur WHERE ur.user_id = auth.uid()))));
CREATE POLICY "Staff can update rooms" ON public.rooms FOR UPDATE USING (has_role(auth.uid(), 'admin') OR (has_role(auth.uid(), 'staff') AND (location_id IN (SELECT ur.location_id FROM user_roles ur WHERE ur.user_id = auth.uid()))));
CREATE POLICY "Admins can delete rooms" ON public.rooms FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all bookings" ON public.bookings FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "Authenticated users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- External calendars policies
CREATE POLICY "Staff can view external calendars" ON public.external_calendars FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can manage external calendars" ON public.external_calendars FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Blocked dates policies
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);
CREATE POLICY "Staff can manage blocked dates" ON public.blocked_dates FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Activity logs policies
CREATE POLICY "Authenticated users can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can view activity logs" ON public.activity_logs FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Payment settings policies
CREATE POLICY "Admins can manage payment settings" ON public.payment_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Bank payment requests policies
CREATE POLICY "Users can create bank payment requests" ON public.bank_payment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own bank payment requests" ON public.bank_payment_requests FOR SELECT USING (guest_email = (SELECT profiles.email FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Staff can view bank payment requests" ON public.bank_payment_requests FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can update bank payment requests" ON public.bank_payment_requests FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- 7. CREATE STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Storage policies for payment-proofs bucket
CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can view their own payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Staff can view all payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff')));

-- 8. INSERT DATA
-- =====================================================

-- Insert locations
INSERT INTO public.locations (id, name, country, city, address, currency, is_active) VALUES
  ('8599d552-8c3a-45d8-99db-5651da5fdee6', 'MBA Suites Lagos', 'Nigeria', 'Lagos, Lekki', 'Lekki Phase 1, Lagos, Nigeria', 'NGN', true),
  ('9e1f4b78-9312-4015-b238-837d0a4af41c', 'MBA Suites Kenya', 'Kenya', 'Nakuru', 'Nakuru City, Kenya', 'KES', true),
  ('f2595695-5e03-476c-8803-755cba453d67', 'MBA Suites USA', 'USA', 'Illinois, Georgia', 'Illinois & Georgia, United States', 'USD', true);

-- Insert rooms
INSERT INTO public.rooms (id, title, room_number, room_type, price_per_night, max_guests, description, amenities, image_url, is_available, location_id) VALUES
  ('75a85c5d-9e24-40fe-8ff5-cdb723e7fc96', 'Deluxe Ocean View Suite', '101', 'deluxe', 45000.00, 2, 'Stunning ocean views with modern luxury amenities', ARRAY['WiFi', 'Air Conditioning', 'Ocean View', 'Mini Bar', 'Room Service'], 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
  ('b4ef55ef-2eea-4776-9e95-7248aac89385', 'Standard Comfort Room', '102', 'standard', 25000.00, 2, 'Comfortable and affordable accommodation', ARRAY['WiFi', 'Air Conditioning', 'TV', 'En-suite Bathroom'], 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
  ('bcca6f53-3f18-4c97-90f3-db2ae4671387', 'Executive Business Suite', '201', 'suite', 75000.00, 4, 'Perfect for business travelers with dedicated workspace', ARRAY['WiFi', 'Air Conditioning', 'Work Desk', 'Meeting Room Access', 'Breakfast Included'], 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
  ('599959fd-6473-41d0-b7d4-9ff7513eb270', 'Lagos Business Deluxe', 'L105', 'deluxe', 65000.00, 2, 'Modern deluxe room designed for productivity with ergonomic workspace, high-speed internet, and meeting room access.', ARRAY['WiFi', 'Air Conditioning', 'Ergonomic Workspace', 'Meeting Room Access', 'Coffee Machine', 'Smart TV'], 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
  ('bcf90c71-bf91-4a55-a763-4e277f5b6cf8', 'Lagos Premium Suite', 'L201', 'suite', 50000.00, 4, 'Luxurious suite with panoramic views of Lagos skyline, featuring a king-size bed, private balcony, and premium amenities for the discerning traveler.', ARRAY['WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Smart TV', 'Private Balcony', 'City View'], 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', true, '8599d552-8c3a-45d8-99db-5651da5fdee6'),
  ('3ccb6c50-7f85-4e8d-918d-71798886244f', 'Safari View Deluxe', '301', 'deluxe', 8500.00, 2, 'Wake up to breathtaking safari views', ARRAY['WiFi', 'Air Conditioning', 'Safari View', 'Mini Bar', 'Balcony'], 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', true, '9e1f4b78-9312-4015-b238-837d0a4af41c'),
  ('bfee7248-75d4-48f9-934c-3c0b9bec1dca', 'Nakuru Premium Suite', '401', 'suite', 15000.00, 4, 'Luxurious suite with panoramic views', ARRAY['WiFi', 'Air Conditioning', 'Panoramic View', 'Living Area', 'Kitchenette'], 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', true, '9e1f4b78-9312-4015-b238-837d0a4af41c'),
  ('13cea365-357a-40d3-82f9-f1de8383a4a2', 'Chicago Skyline Suite', '501', 'suite', 299.00, 4, 'Downtown Chicago with stunning skyline views', ARRAY['WiFi', 'Air Conditioning', 'City View', 'Gym Access', 'Concierge'], 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800', true, 'f2595695-5e03-476c-8803-755cba453d67'),
  ('102cee8f-0ba0-4264-b24c-ea6a21122732', 'Standard American Room', '502', 'standard', 129.00, 2, 'Clean and comfortable for every traveler', ARRAY['WiFi', 'Air Conditioning', 'TV', 'Coffee Maker'], 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', true, 'f2595695-5e03-476c-8803-755cba453d67'),
  ('880ce6a8-754a-40fd-a5ee-cf34ea8f312e', 'Georgia Comfort Deluxe', '601', 'deluxe', 199.00, 2, 'Southern hospitality at its finest', ARRAY['WiFi', 'Air Conditioning', 'Garden View', 'Breakfast Included', 'Pool Access'], 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', true, 'f2595695-5e03-476c-8803-755cba453d67');

-- Insert payment settings
INSERT INTO public.payment_settings (setting_key, setting_value, is_encrypted) VALUES
  ('stripe_secret_key', 'pk_test_a905a8db55f5981b0590008b39aee889c830febf', false),
  ('stripe_publishable_key', 'sk_test_7cd882d85742aec6ac4fae20a208f46cf0049c6a', false),
  ('stripe_enabled', 'true', false),
  ('bank_account_name', 'MBA', false),
  ('bank_name', 'First Bank', false),
  ('bank_account_number', '9328740923482093', false),
  ('bank_enabled', 'true', false),
  ('bank_swift_code', '324r2erwe', false),
  ('bank_instructions', '', false),
  ('bank_sort_code', '0893', false),
  ('paystack_enabled', 'false', false),
  ('paystack_secret_key', 'sk_test_7cd882d85742aec6ac4fae20a208f46cf0049c6a', false),
  ('paystack_public_key', 'pk_test_a905a8db55f5981b0590008b39aee889c830febf', false);

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Users will need to re-register as auth.users data cannot be exported
-- 2. After users register, you may need to manually update their roles in user_roles table
-- 3. The admin user (enyaelvis@gmail.com) should be assigned the 'admin' role after signup
-- 4. Bookings and bank_payment_requests reference user_ids that won't exist until users re-register
-- 5. You'll need to set up edge functions separately (sync-calendars, send-booking-email)
-- 6. Remember to configure RESEND_API_KEY in your new project's secrets
-- =====================================================
