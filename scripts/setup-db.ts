import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL || "")

async function setupDatabase() {
  try {
    console.log("Creating tables...")

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        price_usd DECIMAL(10, 2) NOT NULL,
        price_ngn DECIMAL(15, 2) NOT NULL,
        description TEXT,
        amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
        images JSONB DEFAULT '[]'::JSONB,
        max_guests INTEGER DEFAULT 2,
        beds INTEGER DEFAULT 1,
        bathrooms INTEGER DEFAULT 1,
        size_sqm INTEGER DEFAULT 25,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id),
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(20),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        number_of_guests INTEGER NOT NULL,
        total_price_usd DECIMAL(10, 2),
        total_price_ngn DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'unpaid',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS staff_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Seeding rooms...")

    // Seed rooms
    const rooms = [
      {
        name: "Deluxe Ocean View Suite",
        type: "Suite",
        price_usd: 299,
        price_ngn: 450000,
        description: "Stunning ocean views with premium amenities and spacious layout",
        amenities: ["WiFi", "Ocean View", "AC", "Mini Bar", "Bathrobe"],
        max_guests: 4,
        beds: 2,
        bathrooms: 2,
        size_sqm: 65,
      },
      {
        name: "Classic City Room",
        type: "Standard",
        price_usd: 129,
        price_ngn: 195000,
        description: "Comfortable room in the heart of the city with modern amenities",
        amenities: ["WiFi", "City View", "AC", "Work Desk"],
        max_guests: 2,
        beds: 1,
        bathrooms: 1,
        size_sqm: 35,
      },
      {
        name: "Romantic Garden Villa",
        type: "Villa",
        price_usd: 499,
        price_ngn: 750000,
        description: "Private villa with lush garden and private pool access",
        amenities: ["WiFi", "Private Pool", "Garden View", "Jacuzzi", "Butler Service"],
        max_guests: 6,
        beds: 3,
        bathrooms: 3,
        size_sqm: 120,
      },
      {
        name: "Budget Smart Room",
        type: "Standard",
        price_usd: 79,
        price_ngn: 120000,
        description: "Affordable, clean room perfect for business travelers",
        amenities: ["WiFi", "AC", "Work Desk", "Shower"],
        max_guests: 2,
        beds: 1,
        bathrooms: 1,
        size_sqm: 25,
      },
      {
        name: "Family Comfort Suite",
        type: "Suite",
        price_usd: 199,
        price_ngn: 300000,
        description: "Spacious suite ideal for families with kids activities available",
        amenities: ["WiFi", "Kids Welcome", "AC", "Kitchenette", "Game Room Access"],
        max_guests: 5,
        beds: 2,
        bathrooms: 2,
        size_sqm: 55,
      },
      {
        name: "Executive Penthouse",
        type: "Penthouse",
        price_usd: 799,
        price_ngn: 1200000,
        description: "Ultimate luxury with panoramic views and exclusive amenities",
        amenities: ["WiFi", "Panoramic View", "Private Elevator", "Chef Service", "Spa Access"],
        max_guests: 8,
        beds: 4,
        bathrooms: 4,
        size_sqm: 200,
      },
    ]

    for (const room of rooms) {
      await sql`
        INSERT INTO rooms (name, type, price_usd, price_ngn, description, amenities, max_guests, beds, bathrooms, size_sqm, available)
        VALUES (
          ${room.name},
          ${room.type},
          ${room.price_usd},
          ${room.price_ngn},
          ${room.description},
          ${"'{" + room.amenities.join(",") + "}"},
          ${room.max_guests},
          ${room.beds},
          ${room.bathrooms},
          ${room.size_sqm},
          true
        )
      `
    }

    console.log("Creating admin user...")

    // Create admin user (password: admin123)
    const adminPassword = Buffer.from("admin123").toString("base64")
    await sql`
      INSERT INTO staff_users (email, password_hash, name, role, active)
      VALUES ('admin@hotel.com', ${adminPassword}, 'Administrator', 'admin', true)
      ON CONFLICT (email) DO NOTHING
    `

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
