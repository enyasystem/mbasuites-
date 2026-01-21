-- Additional Row-Level Security policies for payments, room_media, and rooms
-- Run this file in the Supabase SQL editor for your project (staging first).

BEGIN;

-- PAYMENTS table: allow owners to read their payments and admins/staff to view all.
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
ON public.payments
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage payments"
ON public.payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ROOM_MEDIA: allow public SELECT (so images are displayable) but restrict mutations to admin/staff
DROP POLICY IF EXISTS "Public can select room_media" ON public.room_media;
DROP POLICY IF EXISTS "Admins can modify room_media" ON public.room_media;

CREATE POLICY "Public can select room_media"
ON public.room_media
FOR SELECT
USING (true);

CREATE POLICY "Admins can modify room_media"
ON public.room_media
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

ALTER TABLE public.room_media ENABLE ROW LEVEL SECURITY;

-- ROOMS: allow public SELECT for browsing, but restrict INSERT/UPDATE/DELETE to admin/staff
DROP POLICY IF EXISTS "Public can select rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;

CREATE POLICY "Public can select rooms"
ON public.rooms
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage rooms"
ON public.rooms
FOR INSERT, UPDATE, DELETE
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

COMMIT;
