-- Migration: Enable RLS and add policies for guest_registrations
-- Restrict access so only admin and staff can insert/select/update entries

-- Ensure the helper function has_role(role, user_id) exists in your DB. It should return boolean.

ALTER TABLE IF EXISTS public.guest_registrations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users with role admin or staff to INSERT
CREATE POLICY guest_registrations_insert_admins_staff
  ON public.guest_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role('admin', auth.uid()) OR has_role('staff', auth.uid())
  );

-- Allow authenticated users with role admin or staff to SELECT
CREATE POLICY guest_registrations_select_admins_staff
  ON public.guest_registrations
  FOR SELECT
  TO authenticated
  USING (
    has_role('admin', auth.uid()) OR has_role('staff', auth.uid())
  );

-- Allow authenticated users with role admin or staff to UPDATE
CREATE POLICY guest_registrations_update_admins_staff
  ON public.guest_registrations
  FOR UPDATE
  TO authenticated
  USING (
    has_role('admin', auth.uid()) OR has_role('staff', auth.uid())
  )
  WITH CHECK (
    has_role('admin', auth.uid()) OR has_role('staff', auth.uid())
  );

-- Allow only admins to DELETE
CREATE POLICY guest_registrations_delete_admins
  ON public.guest_registrations
  FOR DELETE
  TO authenticated
  USING (
    has_role('admin', auth.uid())
  );

COMMENT ON POLICY guest_registrations_insert_admins_staff ON public.guest_registrations IS 'Allow admin/staff to insert guest registrations';
COMMENT ON POLICY guest_registrations_select_admins_staff ON public.guest_registrations IS 'Allow admin/staff to select guest registrations';
COMMENT ON POLICY guest_registrations_update_admins_staff ON public.guest_registrations IS 'Allow admin/staff to update guest registrations';
COMMENT ON POLICY guest_registrations_delete_admins ON public.guest_registrations IS 'Allow admins to delete guest registrations';
