-- Insert sample rooms
INSERT INTO rooms (name, type, price_usd, price_ngn, description, amenities, images, max_guests, beds, bathrooms, size_sqm, available) VALUES
('Deluxe Ocean View Suite', 'Suite', 299.00, 450000.00, 'Luxurious suite with panoramic ocean views, king-size bed, and private balcony. Perfect for romantic getaways.', 
'["Ocean View", "King Bed", "Private Balcony", "Mini Bar", "Smart TV", "Coffee Machine", "Free WiFi", "Air Conditioning", "Safe", "Bathrobe & Slippers"]',
'[{"url": "/placeholder.svg?height=400&width=600", "alt": "Ocean View Suite"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bedroom"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bathroom"}]',
2, 1, 1, 45.5, true),

('Executive Business Room', 'Deluxe', 199.00, 299000.00, 'Modern business room with work desk, ergonomic chair, and high-speed internet. Ideal for business travelers.',
'["City View", "Queen Bed", "Work Desk", "Free WiFi", "Smart TV", "Coffee Machine", "Iron & Board", "Air Conditioning", "Mini Fridge", "Safe"]',
'[{"url": "/placeholder.svg?height=400&width=600", "alt": "Business Room"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Room View"}]',
2, 1, 1, 32.0, true),

('Family Garden Suite', 'Suite', 349.00, 525000.00, 'Spacious family suite with separate living area, garden access, and two bedrooms. Perfect for families.',
'["Garden View", "2 Bedrooms", "Living Room", "Garden Access", "2 Bathrooms", "Kitchen", "Smart TV", "Free WiFi", "Air Conditioning", "Sofa Bed", "Dining Area"]',
'[{"url": "/placeholder.svg?height=400&width=600", "alt": "Family Suite Living"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bedroom"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Kitchen"}]',
6, 3, 2, 85.0, true),

('Standard City Room', 'Standard', 149.00, 224000.00, 'Comfortable standard room with all essential amenities. Great value for money.',
'["City View", "Double Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Coffee Machine", "Work Desk", "Safe"]',
'[{"url": "/placeholder.svg?height=400&width=600", "alt": "Standard Room"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Bathroom"}]',
2, 1, 1, 28.0, true),

('Luxury Presidential Suite', 'Presidential', 799.00, 1200000.00, 'Ultimate luxury with panoramic views, private dining room, jacuzzi, and dedicated butler service.',
'["Panoramic View", "Master Bedroom", "Guest Bedroom", "Private Dining", "Living Room", "Jacuzzi", "Butler Service", "Kitchen", "Balcony", "3 Bathrooms", "Smart Home", "Premium Minibar", "Wine Cellar"]',
'[{"url": "/placeholder.svg?height=400&width=600", "alt": "Presidential Suite Living"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Master Bedroom"}, {"url": "/placeholder.svg?height=400&width=600", "alt": "Suite Bathroom"}]',
4, 2, 3, 120.0, true),

('Cozy Single Room', 'Standard', 99.00, 149000.00, 'Perfect for solo travelers. Compact yet comfortable with all necessities.',
'["City View", "Single Bed", "Smart TV", "Free WiFi", "Air Conditioning", "Work Desk", "Safe"]',
'[{"url": "/placeholder.svg?height=400&width=600", "alt": "Single Room"}]',
1, 1, 1, 18.0, true);
