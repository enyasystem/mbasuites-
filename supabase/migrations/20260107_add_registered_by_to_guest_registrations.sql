-- Migration: Add registered_by (user) to guest_registrations
-- Run in Supabase SQL editor or via psql

ALTER TABLE IF EXISTS public.guest_registrations
  ADD COLUMN IF NOT EXISTS registered_by uuid;

CREATE INDEX IF NOT EXISTS idx_guest_registrations_registered_by ON public.guest_registrations(registered_by);

COMMENT ON COLUMN public.guest_registrations.registered_by IS 'User id (profiles.full_name) of the staff/admin who created the registration';
