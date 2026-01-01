-- Migration: Create helper function has_role(role text, user_id uuid)
-- This function checks the `user_roles` table for a matching role for the given user id.

CREATE OR REPLACE FUNCTION public.has_role(p_role text, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.role::text = p_role
      AND ur.user_id::text = p_user_id::text
  );
$$;

COMMENT ON FUNCTION public.has_role(text, uuid) IS 'Returns true if the given user has the given app role (checks user_roles table)';
