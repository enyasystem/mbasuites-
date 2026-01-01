-- Migration: allow staff/admin to INSERT and SELECT guest_registrations
BEGIN;

-- Allow authenticated staff/admin users to INSERT into guest_registrations
CREATE POLICY allow_staff_insert_guest_registrations ON public.guest_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','staff')
  )
);

-- Allow authenticated staff/admin users to SELECT guest_registrations
CREATE POLICY allow_staff_select_guest_registrations ON public.guest_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','staff')
  )
);

COMMIT;
