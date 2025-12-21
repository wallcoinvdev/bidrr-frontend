-- Direct SQL bulk upload for temp contractors
-- This bypasses the API and inserts directly into the database
-- Run this in your PostgreSQL database (Supabase, Neon, etc.)

-- INSTRUCTIONS:
-- 1. Replace the VALUES below with your actual contractor data from the JSON
-- 2. Run this script in your database client (psql, Supabase SQL editor, etc.)
-- 3. Update the INSERT statements with actual data from your JSON file

-- Example format - replace with your actual data:
INSERT INTO users (
  email,
  password_hash,
  role,
  first_name,
  last_name,
  company_name,
  phone_number,
  business_address,
  city,
  region,
  postal_code,
  company_size,
  website,
  is_temp_account,
  created_at,
  updated_at
) VALUES
  -- Contractor 1
  (
    'contractor1@example.com',
    '$2a$10$default.temp.password.hash', -- Temp password hash (should be reset)
    'contractor',
    'John',
    'Doe',
    'John Doe Contracting',
    '123-456-7890',
    '123 Main St',
    'Saskatoon',
    'SK',
    'S7K 1A1',
    '1-5',
    'https://example.com',
    TRUE,
    NOW(),
    NOW()
  ),
  -- Contractor 2
  (
    'contractor2@example.com',
    '$2a$10$default.temp.password.hash',
    'contractor',
    'Jane',
    'Smith',
    'Smith Home Services',
    '123-456-7891',
    '456 Oak Ave',
    'Regina',
    'SK',
    'S4P 2B2',
    '6-10',
    NULL,
    TRUE,
    NOW(),
    NOW()
  )
  -- Add more contractors here...
ON CONFLICT (email) DO NOTHING;  -- Skip if email already exists

-- After inserting users, insert their services
-- First, get the user IDs that were just created
WITH temp_contractors AS (
  SELECT user_id, email FROM users WHERE is_temp_account = TRUE
)
INSERT INTO contractor_services (contractor_id, service_name, created_at)
SELECT 
  tc.user_id,
  service,
  NOW()
FROM temp_contractors tc
CROSS JOIN LATERAL unnest(ARRAY[
  -- For contractor1@example.com
  'Plumbing',
  'HVAC Maintenance',
  'General Handyman'
  -- Add services here
]) AS service
WHERE tc.email = 'contractor1@example.com'

UNION ALL

SELECT 
  tc.user_id,
  service,
  NOW()
FROM temp_contractors tc
CROSS JOIN LATERAL unnest(ARRAY[
  -- For contractor2@example.com
  'Cleaning',
  'House Cleaning',
  'Deep Cleaning'
  -- Add services here
]) AS service
WHERE tc.email = 'contractor2@example.com';

-- Insert contractor settings (radius)
INSERT INTO contractor_settings (contractor_id, notification_radius_km, created_at, updated_at)
SELECT 
  user_id,
  50, -- Hardcoded to 50km
  NOW(),
  NOW()
FROM users
WHERE is_temp_account = TRUE
ON CONFLICT (contractor_id) DO NOTHING;

-- Verify the upload
SELECT 
  u.email,
  u.company_name,
  u.postal_code,
  u.is_temp_account,
  COUNT(cs.service_name) as service_count,
  cset.notification_radius_km as radius
FROM users u
LEFT JOIN contractor_services cs ON u.user_id = cs.contractor_id
LEFT JOIN contractor_settings cset ON u.user_id = cset.contractor_id
WHERE u.is_temp_account = TRUE
GROUP BY u.user_id, u.email, u.company_name, u.postal_code, u.is_temp_account, cset.notification_radius_km
ORDER BY u.created_at DESC;
