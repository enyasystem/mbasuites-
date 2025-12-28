BEGIN;

-- Replace the broad "Staff can manage room images" policy with explicit policies
DROP POLICY IF EXISTS "Staff can manage room images" ON public.room_images;
DROP POLICY IF EXISTS "Anyone can view room images" ON public.room_images;

-- Anyone can read room images (they are public URLs)
CREATE POLICY "Anyone can view room images"
ON public.room_images
FOR SELECT
USING (true);

-- Admins can insert room images
CREATE POLICY "Admins can insert room images"
ON public.room_images
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Staff can insert room images only for rooms at their locations
CREATE POLICY "Staff can insert room images"
ON public.room_images
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_images.room_id
      AND r.location_id IN (
        SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
      )
  )
);

-- Admins can update room images
CREATE POLICY "Admins can update room images"
ON public.room_images
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Staff can update room images subject to room location ownership
CREATE POLICY "Staff can update room images"
ON public.room_images
FOR UPDATE
USING (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_images.room_id
      AND r.location_id IN (
        SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
      )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_images.room_id
      AND r.location_id IN (
        SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
      )
  )
);

-- Admins can delete, staff can delete for their locations
CREATE POLICY "Admins can delete room images"
ON public.room_images
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can delete room images"
ON public.room_images
FOR DELETE
USING (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_images.room_id
      AND r.location_id IN (
        SELECT ur.location_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
      )
  )
);

ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

COMMIT;
