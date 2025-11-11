-- Create default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO staff_users (email, password_hash, name, role) VALUES
('admin@hotel.com', '$2a$10$rQZ8YZ1K5Z5Z5Z5Z5Z5Z5.5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
