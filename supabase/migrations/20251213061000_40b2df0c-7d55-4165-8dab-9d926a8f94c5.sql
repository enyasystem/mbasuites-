-- Create locations table for multi-branch support
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the three branches
INSERT INTO public.locations (name, country, city, address, currency) VALUES
  ('MBA Suites Lagos', 'Nigeria', 'Lagos, Lekki', 'Lekki Phase 1, Lagos, Nigeria', 'NGN'),
  ('MBA Suites Kenya', 'Kenya', 'Nakuru', 'Nakuru City, Kenya', 'KES'),
  ('MBA Suites USA', 'USA', 'Illinois, Georgia', 'Illinois & Georgia, United States', 'USD');

-- Enable RLS on locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active locations
CREATE POLICY "Anyone can view active locations"
  ON public.locations
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Only admins can manage locations
CREATE POLICY "Admins can manage locations"
  ON public.locations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add location_id to rooms table
ALTER TABLE public.rooms ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Add location_id to user_roles for staff branch assignment
ALTER TABLE public.user_roles ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Create index for faster location-based queries
CREATE INDEX idx_rooms_location ON public.rooms(location_id);
CREATE INDEX idx_user_roles_location ON public.user_roles(location_id);

-- Update rooms RLS to include location-based access for staff
DROP POLICY IF EXISTS "Staff can update rooms" ON public.rooms;
CREATE POLICY "Staff can update rooms"
  ON public.rooms
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    (has_role(auth.uid(), 'staff') AND location_id IN (
      SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Staff can insert rooms" ON public.rooms;
CREATE POLICY "Staff can insert rooms"
  ON public.rooms
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    (has_role(auth.uid(), 'staff') AND location_id IN (
      SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    ))
  );

-- Add trigger for updated_at on locations
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();