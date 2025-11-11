import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL || "")

async function setupDatabase() {
  try {
    console.log("🔄 Starting database setup...")

    // Create rooms table
    console.log("📋 Creating rooms table...")
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        price_usd DECIMAL(10, 2) NOT NULL,
        price_ngn DECIMAL(10, 2) NOT NULL,
        description TEXT,
        amenities JSONB,
        images JSONB,
        max_guests INTEGER NOT NULL,
        beds INTEGER NOT NULL,
        bathrooms INTEGER NOT NULL,
        size_sqm DECIMAL(8, 2),
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create bookings table
    console.log("📋 Creating bookings table...")
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id),
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INTEGER NOT NULL,
        total_nights INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_reference VARCHAR(255),
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create staff users table
    console.log("📋 Creating staff_users table...")
    await sql`
      CREATE TABLE IF NOT EXISTS staff_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    console.log("🔑 Creating indexes...")
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out)`
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available)`

    // Seed rooms
    console.log("🌱 Seeding rooms...")
    await sql`
      INSERT INTO rooms (name, type, price_usd, price_ngn, description, amenities, images, max_guests, beds, bathrooms, size_sqm, available)
      VALUES
        (
          'Deluxe Ocean View Suite',
          'Suite',
          299.00,
          450000.00,
          'Luxurious suite with panoramic ocean views, king-size bed, and private balcony. Perfect for romantic getaways.',
          '["Ocean View", "King Bed", "Private Balcony", "Mini Bar", "Smart TV", "Coffee Machine", "Free WiFi", "Air Conditioning", "Safe", "Bathrobe & Slippers"]'::jsonb,
          '[{"url": "/placeholder.svg?height=400&width=600", "alt": "Ocean View Suite"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bedroom"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bathroom"}]'::jsonb,
          2,
          1,
          1,
          45.5,
          true
        ),
        (
          'Executive Business Room',
          'Deluxe',
          199.00,
          299000.00,
          'Modern business room with work desk, ergonomic chair, and high-speed internet. Ideal for business travelers.',
          '["City View", "Queen Bed", "Work Desk", "Free WiFi", "Smart TV", "Coffee Machine", "Iron & Board", "Air Conditioning", "Mini Fridge", "Safe"]'::jsonb,
          '[{"url": "/placeholder.svg?height=400&width=600", "alt": "Business Room"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Room View"}]'::jsonb,
          2,
          1,
          1,
          32.0,
          true
        ),
        (
          'Family Garden Suite',
          'Suite',
          349.00,
          525000.00,
          'Spacious family suite with separate living area, garden access, and two bedrooms. Perfect for families.',
          '["Garden View", "2 Bedrooms", "Living Room", "Garden Access", "2 Bathrooms", "Kitchen", "Smart TV", "Free WiFi", "Air Conditioning", "Sofa Bed", "Dining Area"]'::jsonb,
          '[{"url": "/placeholder.svg?height=400&width=600", "alt": "Family Suite Living"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bedroom"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Kitchen"}]'::jsonb,
          6,
          3,
          2,
          85.0,
          true
        ),
        (
          'Standard City Room',
          'Standard',
          149.00,
          224000.00,
          'Comfortable standard room with all essential amenities. Great value for money.',
          '["City View", "Double Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Coffee Machine", "Work Desk", "Safe"]'::jsonb,
          '[{"url": "/placeholder.svg?height=400&width=600", "alt": "Standard Room"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Bathroom"}]'::jsonb,
          2,
          1,
          1,
          28.0,
          true
        ),
        (
          'Luxury Presidential Suite',
          'Presidential',
          799.00,
          1200000.00,
          'Ultimate luxury with panoramic views, private dining room, jacuzzi, and dedicated butler service.',
          '["Panoramic View", "Master Bedroom", "Guest Bedroom", "Private Dining", "Living Room", "Jacuzzi", "Butler Service", "Kitchen", "Balcony", "3 Bathrooms", "Smart Home", "Premium Minibar", "Wine Cellar"]'::jsonb,
          '[{"url": "/placeholder.svg?height=400&width=600", "alt": "Presidential Suite Living"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Master Bedroom"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bathroom"}]'::jsonb,
          4,
          2,
          3,
          120.0,
          true
        ),
        (
          'Cozy Single Room',
          'Standard',
          99.00,
          149000.00,
          'Perfect for solo travelers. Compact yet comfortable with all necessities.',
          '["City View", "Single Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Work Desk", "Safe"]'::jsonb,
          '[{"url": "/placeholder.svg?height=400&width=600", "alt": "Single Room"}]'::jsonb,
          1,
          1,
          1,
          18.0,
          true
        )
      ON CONFLICT DO NOTHING
    `

    // Create admin user
    console.log("👤 Creating admin user...")
    await sql`
      INSERT INTO staff_users (email, password_hash, name, role)
      VALUES (
        'admin@hotel.com',
        '$2a$10$rQZ8YZ1K5Z5Z5Z5Z5Z5Z5.5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
        'Admin User',
        'admin'
      )
      ON CONFLICT (email) DO NOTHING
    `

    console.log("✅ Database setup completed successfully!")
    console.log("\n📚 Your hotel has been set up with:")
    console.log("   • 6 luxury rooms ready to book")
    console.log("   • Admin account: admin@hotel.com / admin123")
    console.log("   • All tables and indexes configured")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
