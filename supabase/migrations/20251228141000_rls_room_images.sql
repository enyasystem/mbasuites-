BEGIN;

-- Allow anyone to read room images (they are public URLs served from storage)
DROP POLICY IF EXISTS "Anyone can view room images" ON public.room_images;
CREATE POLICY "Anyone can view room images"
ON public.room_images
FOR SELECT
USING (true);

-- Allow Admins/Staff to manage room images (staff limited to their locations)
DROP POLICY IF EXISTS "Staff can manage room images" ON public.room_images;
CREATE POLICY "Staff can manage room images"
ON public.room_images
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'staff'::app_role)
    AND (
      EXISTS (
        SELECT 1 FROM public.rooms r WHERE r.id = room_images.room_id
        AND r.location_id IN (SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid())
      )
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'staff'::app_role)
    AND (
      EXISTS (
        SELECT 1 FROM public.rooms r WHERE r.id = room_images.room_id
        AND r.location_id IN (SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid())
      )
    )
  )
);

ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

COMMIT;
