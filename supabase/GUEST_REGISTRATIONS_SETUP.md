Guest Registrations — Supabase setup

1) Create the database table
- Open the Supabase project SQL editor and run the migration file:
  - `supabase/migrations/20260101_create_guest_registrations.sql`
- Or run locally with psql against your DB.

2) Create a storage bucket for ID uploads
- In Supabase Console -> Storage -> New bucket
  - Bucket ID: `guest_ids`
  - Public/Private: choose `public` if you want uploaded attachments to be directly viewable via public URL. For private buckets, you'll need signed URLs.
  - Recommended settings: set `Cache-Control` to `max-age=0, no-cache` on upload to ensure fresh reads.

3) Policies / security
- If the admin UI is authenticated and only staff/admin users should upload/view attachments, leave the bucket private and generate signed URLs when needed.
- If attachments can be public, set bucket public and add RLS policies on `guest_registrations` if you want to restrict who can insert/read entries.

4) Example: grant insert/select to authenticated users only (run in SQL editor)

-- allow authenticated users to insert guest registrations
-- adjust roles/conditions to match your auth model
CREATE POLICY "authenticated_can_insert_guest_registrations" ON public.guest_registrations
  FOR INSERT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_select_guest_registrations" ON public.guest_registrations
  FOR SELECT
  TO authenticated
  USING (true);

5) Notes for the app
- The front-end saves files to `guest_ids` bucket and stores the returned public URL in `identification_attachment_url`.
- If the bucket is private, change the upload flow to request a signed URL from the backend or use Supabase's `createSignedUrl`.

6) Rollback
- To drop the table (use with caution):
  DROP TABLE IF EXISTS public.guest_registrations;

If you want, I can open a PR with these files, or generate a supabase CLI migration that matches your existing migration naming conventions.
