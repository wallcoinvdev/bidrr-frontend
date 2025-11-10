-- Add hero_heading_variation column to users table for A/B testing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hero_heading_variation VARCHAR(1);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_hero_heading_variation 
ON users(hero_heading_variation);

-- Add comment explaining the column
COMMENT ON COLUMN users.hero_heading_variation IS 'Stores which hero heading variation (A-E) the user saw on homepage for A/B testing';
