-- Clear existing rooms data first (for reseeding)
TRUNCATE TABLE rooms RESTART IDENTITY CASCADE;

-- Replacing placeholder images with real Unsplash URLs for all 6 rooms

-- Insert sample rooms with real image URLs from Unsplash
INSERT INTO rooms (
  name, type, price_usd, price_ngn, description, amenities, images, max_guests, beds, bathrooms, size_sqm, available
) VALUES
-- Deluxe Ocean View Suite
('Deluxe Ocean View Suite', 'Suite', 299.00, 450000.00,
'Luxurious suite with panoramic ocean views, king-size bed, and private balcony. Perfect for romantic getaways.',
'["Ocean View", "King Bed", "Private Balcony", "Mini Bar", "Smart TV", "Coffee Machine", "Free WiFi", "Air Conditioning", "Safe", "Bathrobe & Slippers"]',
'[{"url": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800", "alt": "Ocean View Suite"},
  {"url": "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?w=800", "alt": "Suite Bedroom"},
  {"url": "https://images.unsplash.com/photo-1560067174-894abc09b55f?w=800", "alt": "Suite Bathroom"}]',
2, 1, 1, 45.5, true),

-- Executive Business Room
('Executive Business Room', 'Deluxe', 199.00, 299000.00,
'Modern business room with work desk, ergonomic chair, and high-speed internet. Ideal for business travelers.',
'["City View", "Queen Bed", "Work Desk", "Free WiFi", "Smart TV", "Coffee Machine", "Iron & Board", "Air Conditioning", "Mini Fridge", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1559599238-59a575dbd6f6?w=800", "alt": "Business Room"},
  {"url": "https://images.unsplash.com/photo-1590490360182-66323955634b?w=800", "alt": "Room View"}]',
2, 1, 1, 32.0, true),

-- Family Garden Suite
('Family Garden Suite', 'Suite', 349.00, 525000.00,
'Spacious family suite with separate living area, garden access, and two bedrooms. Perfect for families.',
'["Garden View", "2 Bedrooms", "Living Room", "Garden Access", "2 Bathrooms", "Kitchen", "Smart TV", "Free WiFi", "Air Conditioning", "Sofa Bed", "Dining Area"]',
'[{"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "alt": "Family Suite Living"},
  {"url": "https://images.unsplash.com/photo-1600047509231-8fc8fa3d2c13?w=800", "alt": "Suite Bedroom"},
  {"url": "https://images.unsplash.com/photo-1597003552304-8a2f92b693c3?w=800", "alt": "Suite Kitchen"}]',
6, 3, 2, 85.0, true),

-- Standard City Room
('Standard City Room', 'Standard', 149.00, 224000.00,
'Comfortable standard room with all essential amenities. Great value for money.',
'["City View", "Double Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Coffee Machine", "Work Desk", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "alt": "Standard Room"},
  {"url": "https://images.unsplash.com/photo-1600585152907-8d1e248d9c88?w=800", "alt": "Bathroom"}]',
2, 1, 1, 28.0, true),

-- Luxury Presidential Suite
('Luxury Presidential Suite', 'Presidential', 799.00, 1200000.00,
'Ultimate luxury with panoramic views, private dining room, jacuzzi, and dedicated butler service.',
'["Panoramic View", "Master Bedroom", "Guest Bedroom", "Private Dining", "Living Room", "Jacuzzi", "Butler Service", "Kitchen", "Balcony", "3 Bathrooms", "Smart Home", "Premium Minibar", "Wine Cellar"]',
'[{"url": "https://images.unsplash.com/photo-1600607687962-6ff0f2f2d1c1?w=800", "alt": "Presidential Suite Living"},
  {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "alt": "Master Bedroom"},
  {"url": "https://images.unsplash.com/photo-1600047509231-8fc8fa3d2c13?w=800", "alt": "Suite Bathroom"}]',
4, 2, 3, 120.0, true),

-- Cozy Single Room
('Cozy Single Room', 'Standard', 99.00, 149000.00,
'Perfect for solo travelers. Compact yet comfortable with all necessities.',
'["City View", "Single Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Work Desk", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800", "alt": "Single Room"}]',
1, 1, 1, 18.0, true);
