-- Update admin user with plain password for demo
-- In production, this should be a properly hashed password
UPDATE staff_users 
SET password_hash = 'admin123'
WHERE email = 'admin@hotel.com';
