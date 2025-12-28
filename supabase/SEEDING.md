Seeding MBA Suites rooms

This project includes a SQL migration and an optional script to seed rooms into the database using the images in `public/mba suites pictures`.

Files
- `supabase/migrations/20251228123000_seed_mba_rooms.sql` — SQL insert statements to add the requested rooms (single, queen, master suite, 1-bed apt, 4-bed house, 3-bed house) tied to the Lagos location.
- `scripts/seed-mba-rooms.ts` — A Node.js script that uses `@supabase/supabase-js` and the Supabase service role key to insert the same data programmatically (useful for local dev).

How to run the SQL migration (Supabase)
1. Open your Supabase project and go to SQL Editor → New query.
2. Paste the contents of `supabase/migrations/20251228123000_seed_mba_rooms.sql` and run it.

How to run the verification / programmatic script (local)
1. Create a `.env` file with these vars:
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>

2. Install ts-node locally (if not installed):
   npm install -D ts-node

3. Run the script:
   npx ts-node scripts/seed-mba-rooms.ts

Notes
- The seed SQL now references full public storage URLs using the pattern `https://ehpdimadogtqzarriuzz.supabase.co/storage/v1/object/public/room-images/<filename>` so future runs will insert stable public image URLs.
- The programmatic script checks for existing rooms by title to avoid duplicates.

If you already uploaded the images to the `room-images` bucket (looks like you did), run the migration `supabase/migrations/20251228134000_convert_room_image_paths_to_public_urls.sql` to convert any existing `room-images/<filename>` values into full public URLs in the database.
- Master suites include `Private Balcony` in amenities as requested.

Uploading images to Supabase storage
1. Create a `.env` file with these vars:
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>

2. Install dev dependencies if needed:
   npm install -D ts-node @supabase/supabase-js

3. Run the upload script (this uploads all files in `public/mba suites pictures` to the `room-images` bucket and writes a mapping file at `supabase/room-images-uploaded.json`):
   npx ts-node scripts/upload-room-images.ts

4. (Optional) Apply the migration `supabase/migrations/20251228133000_update_room_image_paths_to_storage.sql` to convert any existing rows that reference the old public paths into `room-images/<filename>` paths.

If you'd like, I can also:
- Run the upload script for you (requires the service role key).
- Update the application to construct full public URLs using Supabase storage helpers if you prefer to store full URLs in the DB.
