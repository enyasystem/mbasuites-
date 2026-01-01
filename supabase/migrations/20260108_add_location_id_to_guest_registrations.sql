-- Migration: Add location_id to guest_registrations
-- Run in Supabase SQL editor or via psql

ALTER TABLE IF EXISTS public.guest_registrations
  ADD COLUMN IF NOT EXISTS location_id uuid;

-- Optional FK to locations table (keeps referential integrity); adjust schema name if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'guest_registrations_location_id_fkey'
      AND t.relname = 'guest_registrations'
  ) THEN
    ALTER TABLE public.guest_registrations
      ADD CONSTRAINT guest_registrations_location_id_fkey FOREIGN KEY (location_id)
      REFERENCES public.locations(id)
      ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_guest_registrations_location_id ON public.guest_registrations(location_id);

COMMENT ON COLUMN public.guest_registrations.location_id IS 'Optional associated location for the registration (locations.id)';
