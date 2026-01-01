-- Migration: Create guest_registrations table
-- Run via psql or Supabase SQL editor

-- Ensure extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.guest_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age integer,
  date_of_birth date,
  gender text,
  occupation text,
  religion text,
  marital_status text,
  nationality text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  phone text,
  email text,
  id_number text,
  purpose text,
  emergency_contact_name text,
  emergency_contact_phone text,
  identification_attachment_url text,
  hard_copy_attached boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Helpful index for recent queries
CREATE INDEX IF NOT EXISTS idx_guest_registrations_created_at ON public.guest_registrations(created_at DESC);

COMMENT ON TABLE public.guest_registrations IS 'Manual guest registration entries created by front-desk/admin on check-in.';
