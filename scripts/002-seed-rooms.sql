-- Clear existing rooms data first (for reseeding)
TRUNCATE TABLE rooms RESTART IDENTITY CASCADE;

-- Comprehensive room seed data with real Unsplash images
-- Total: 12 diverse room types covering various guest needs and budgets

-- Insert sample rooms with real image URLs from Unsplash
INSERT INTO rooms (
  name, type, price_usd, price_ngn, description, amenities, images, max_guests, beds, bathrooms, size_sqm, available
) VALUES

-- 1. Deluxe Ocean View Suite
('Deluxe Ocean View Suite', 'Suite', 299.00, 450000.00,
'Luxurious suite with panoramic ocean views, king-size bed, and private balcony. Perfect for romantic getaways.',
'["Ocean View", "King Bed", "Private Balcony", "Mini Bar", "Smart TV", "Coffee Machine", "Free WiFi", "Air Conditioning", "Safe", "Bathrobe & Slippers"]',
'[{"url": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800", "alt": "Ocean View Suite"},
  {"url": "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?w=800", "alt": "Suite Bedroom"},
  {"url": "https://images.unsplash.com/photo-1560067174-894abc09b55f?w=800", "alt": "Suite Bathroom"}]',
2, 1, 1, 45.5, true),

-- 2. Executive Business Room
('Executive Business Room', 'Deluxe', 199.00, 299000.00,
'Modern business room with work desk, ergonomic chair, and high-speed internet. Ideal for business travelers.',
'["City View", "Queen Bed", "Work Desk", "Free WiFi", "Smart TV", "Coffee Machine", "Iron & Board", "Air Conditioning", "Mini Fridge", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1559599238-59a575dbd6f6?w=800", "alt": "Business Room"},
  {"url": "https://images.unsplash.com/photo-1590490360182-66323955634b?w=800", "alt": "Room View"}]',
2, 1, 1, 32.0, true),

-- 3. Family Garden Suite
('Family Garden Suite', 'Suite', 349.00, 525000.00,
'Spacious family suite with separate living area, garden access, and two bedrooms. Perfect for families.',
'["Garden View", "2 Bedrooms", "Living Room", "Garden Access", "2 Bathrooms", "Kitchen", "Smart TV", "Free WiFi", "Air Conditioning", "Sofa Bed", "Dining Area"]',
'[{"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "alt": "Family Suite Living"},
  {"url": "https://images.unsplash.com/photo-1600047509231-8fc8fa3d2c13?w=800", "alt": "Suite Bedroom"},
  {"url": "https://images.unsplash.com/photo-1597003552304-8a2f92b693c3?w=800", "alt": "Suite Kitchen"}]',
6, 3, 2, 85.0, true),

-- 4. Standard City Room
('Standard City Room', 'Standard', 149.00, 224000.00,
'Comfortable standard room with all essential amenities. Great value for money.',
'["City View", "Double Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Coffee Machine", "Work Desk", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800", "alt": "Standard Room"},
  {"url": "https://images.unsplash.com/photo-1600585152907-8d1e248d9c88?w=800", "alt": "Bathroom"}]',
2, 1, 1, 28.0, true),

-- 5. Luxury Presidential Suite
('Luxury Presidential Suite', 'Presidential', 799.00, 1200000.00,
'Ultimate luxury with panoramic views, private dining room, jacuzzi, and dedicated butler service.',
'["Panoramic View", "Master Bedroom", "Guest Bedroom", "Private Dining", "Living Room", "Jacuzzi", "Butler Service", "Kitchen", "Balcony", "3 Bathrooms", "Smart Home", "Premium Minibar", "Wine Cellar"]',
'[{"url": "https://images.unsplash.com/photo-1600607687962-6ff0f2f2d1c1?w=800", "alt": "Presidential Suite Living"},
  {"url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", "alt": "Master Bedroom"},
  {"url": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800", "alt": "Suite Bathroom"}]',
4, 2, 3, 120.0, true),

-- 6. Cozy Single Room
('Cozy Single Room', 'Standard', 99.00, 149000.00,
'Perfect for solo travelers. Compact yet comfortable with all necessities.',
'["City View", "Single Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Work Desk", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", "alt": "Single Room"}]',
1, 1, 1, 18.0, true),

-- Adding 6 new diverse room types with real Unsplash images

-- 7. Penthouse Sky Loft
('Penthouse Sky Loft', 'Penthouse', 999.00, 1500000.00,
'Stunning penthouse with 360-degree city views, rooftop terrace, and modern amenities. The ultimate urban luxury experience.',
'["Rooftop Terrace", "360° Views", "King Bed", "Living Room", "Full Kitchen", "2 Bathrooms", "Home Theater", "Smart Home System", "Wine Cooler", "Fireplace", "Private Elevator", "Gym Access"]',
'[{"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "alt": "Penthouse Living Room"},
  {"url": "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", "alt": "Penthouse Terrace"},
  {"url": "https://images.unsplash.com/photo-1602872030219-ad2b9a54315c?w=800", "alt": "Master Suite"}]',
4, 2, 2, 150.0, true),

-- 8. Romantic Honeymoon Suite
('Romantic Honeymoon Suite', 'Suite', 399.00, 600000.00,
'Intimate suite designed for couples with rose petal turndown service, champagne on arrival, and jacuzzi tub.',
'["Ocean View", "King Canopy Bed", "In-Room Jacuzzi", "Private Balcony", "Champagne Package", "Rose Petal Service", "Couples Massage Package", "Mini Bar", "Smart TV", "Safe", "Bathrobes"]',
'[{"url": "https://images.unsplash.com/photo-1590490359854-e2da656e9c7d?w=800", "alt": "Honeymoon Suite Bedroom"},
  {"url": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", "alt": "Suite Jacuzzi"},
  {"url": "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800", "alt": "Balcony View"}]',
2, 1, 1, 50.0, true),

-- 9. Twin Deluxe Room
('Twin Deluxe Room', 'Deluxe', 179.00, 269000.00,
'Spacious room with two queen beds, perfect for friends or colleagues traveling together.',
'["City View", "2 Queen Beds", "Work Area", "Mini Fridge", "Coffee Machine", "Smart TV", "Free WiFi", "Air Conditioning", "Iron & Board", "Safe"]',
'[{"url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800", "alt": "Twin Deluxe Room"},
  {"url": "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800", "alt": "Room Interior"}]',
4, 2, 1, 38.0, true),

-- 10. Accessible Comfort Room
('Accessible Comfort Room', 'Standard', 159.00, 239000.00,
'Wheelchair-accessible room with wide doorways, roll-in shower, and all necessary accommodations.',
'["Accessible", "Queen Bed", "Roll-in Shower", "Grab Bars", "Lower Fixtures", "Visual Alarms", "Smart TV", "Free WiFi", "Air Conditioning", "Emergency Pull Cord", "Work Desk"]',
'[{"url": "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800", "alt": "Accessible Room"},
  {"url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800", "alt": "Accessible Bathroom"}]',
2, 1, 1, 35.0, true),

-- 11. Studio Apartment Suite
('Studio Apartment Suite', 'Suite', 279.00, 419000.00,
'Extended stay studio with full kitchenette, separate living space, and washer/dryer. Perfect for long-term guests.',
'["Full Kitchenette", "Living Area", "Queen Bed", "Washer/Dryer", "Dining Table", "Work Desk", "Smart TV", "Free WiFi", "Air Conditioning", "Dishwasher", "Cookware Included"]',
'[{"url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800", "alt": "Studio Living Area"},
  {"url": "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800", "alt": "Studio Kitchen"},
  {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "alt": "Studio Bedroom"}]',
2, 1, 1, 42.0, true),

-- 12. Junior Suite with Terrace
('Junior Suite with Terrace', 'Suite', 259.00, 389000.00,
'Elegant junior suite featuring a private furnished terrace with garden views and separate seating area.',
'["Garden View", "Private Terrace", "King Bed", "Seating Area", "Outdoor Furniture", "Mini Bar", "Smart TV", "Coffee Machine", "Free WiFi", "Air Conditioning", "Safe", "Bathrobe"]',
'[{"url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800", "alt": "Junior Suite Bedroom"},
  {"url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "alt": "Suite Terrace"},
  {"url": "https://images.unsplash.com/photo-1571508601936-66fc5edb0a2f?w=800", "alt": "Seating Area"}]',
2, 1, 1, 40.0, true);
