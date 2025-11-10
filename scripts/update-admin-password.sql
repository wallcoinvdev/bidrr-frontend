-- First, run the generate-admin-password.js script to get the hash
-- Then replace YOUR_GENERATED_HASH_HERE with the actual hash and run this:

UPDATE users 
SET password = 'YOUR_GENERATED_HASH_HERE'
WHERE email = 'admin@bidrr.ca';
