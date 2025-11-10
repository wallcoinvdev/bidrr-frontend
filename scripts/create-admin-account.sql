-- Create admin account with password: 123456
-- Generated hash using bcrypt

INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  phone_number,
  phone_verified,
  created_at,
  updated_at
) VALUES (
  'admin@bidrr.com',
  '$2a$10$YourHashWillGoHere',
  'Admin User',
  'admin',
  '+10000000000',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'admin',
  updated_at = NOW();
