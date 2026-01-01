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
- The `guest_registrations` table should enable Row Level Security (RLS) and policies should be created to restrict access.
- We've added a migration `supabase/migrations/20260102_guest_registrations_policies.sql` which enables RLS and creates policies that:
  - Allow only users with `admin` or `staff` role to INSERT and SELECT.
  - Allow only `admin` or `staff` to UPDATE.
  - Allow only `admin` to DELETE.

- The policies rely on the `has_role(role, user_id)` helper function present in your DB (see existing functions in your schema). If you don't have it, replace the checks with your role logic or join to your `user_roles` table in the policy expressions.

4) Example (legacy)
- If you previously used an open policy (authenticated users allowed), remove those and apply the stricter policies in the migration file above.

5) Notes for the app
- The front-end saves files to `guest_ids` bucket and stores the returned public URL in `identification_attachment_url`.
- If the bucket is private, change the upload flow to request a signed URL from the backend or use Supabase's `createSignedUrl`.

6) Rollback
- To drop the table (use with caution):
  DROP TABLE IF EXISTS public.guest_registrations;

If you want, I can open a PR with these files, or generate a supabase CLI migration that matches your existing migration naming conventions.
