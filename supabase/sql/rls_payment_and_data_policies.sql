-- RLS and Indexes for payment_settings, profiles, and bookings
-- Run this file in the Supabase SQL editor for your project.

BEGIN;

-- 1) Remove overly-broad admin policy if present
DROP POLICY IF EXISTS "Admins can manage payment settings" ON public.payment_settings;

-- 2) Allow authenticated users to read payment settings (safer than allowing anon)
DROP POLICY IF EXISTS "Authenticated can read payment settings" ON public.payment_settings;
CREATE POLICY "Authenticated can read payment settings"
ON public.payment_settings
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3) Restrict writes to admins only (one policy per command)
DROP POLICY IF EXISTS "Admins can insert payment settings" ON public.payment_settings;
CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update payment settings" ON public.payment_settings;
CREATE POLICY "Admins can update payment settings"
ON public.payment_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete payment settings" ON public.payment_settings;
CREATE POLICY "Admins can delete payment settings"
ON public.payment_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4) Prevent duplicate keys for stable reads/writes
CREATE UNIQUE INDEX IF NOT EXISTS payment_settings_setting_key_idx
ON public.payment_settings (setting_key);

-- Ensure row level security is enabled (harmless if already enabled)
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- Lock down profiles so users can only access their own profile
-- =======================================================
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins/Staff can select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can select own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admins/Staff can select profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- Lock down bookings so users only see/manage their own bookings
-- =======================================================
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins/Staff can view all bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings"
ON public.bookings
FOR UPDATE
USING (
  user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY "Admins/Staff can view all bookings"
ON public.bookings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

COMMIT;
