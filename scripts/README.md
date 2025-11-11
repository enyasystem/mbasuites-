# Database Setup Scripts

Execute these SQL scripts in your Neon database in the following order:

## 1. Create Tables
\`\`\`bash
# Run scripts/001-create-tables.sql in Neon SQL Editor
\`\`\`

This creates the `rooms`, `bookings`, and `staff_users` tables with proper indexes.

## 2. Seed Rooms Data
\`\`\`bash
# Run scripts/002-seed-rooms.sql in Neon SQL Editor
\`\`\`

This will:
- Clear any existing room data (TRUNCATE)
- Insert 6 luxury hotel rooms with real Unsplash images
- Each room includes detailed amenities, pricing in USD/NGN, and multiple high-quality images

## 3. Create Admin User
\`\`\`bash
# Run scripts/003-create-admin-user.sql in Neon SQL Editor
\`\`\`

Creates the default admin account for staff access.

## Reseeding

If you need to reseed the rooms data (e.g., to update images), simply run script 002 again. It will automatically clear existing data before inserting fresh records.

## Image Sources

All room images are sourced from Unsplash with proper CDN URLs for optimal loading performance.
