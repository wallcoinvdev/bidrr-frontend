-- schema.sql - Combined schema

CREATE SCHEMA IF NOT EXISTS public;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Define enum types
DO $$ BEGIN
  CREATE TYPE role_enum AS ENUM ('homeowner', 'contractor');
  CREATE TYPE company_size_enum AS ENUM ('1', '2-10', '11-50', '51-200', '200+');
  CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');
  CREATE TYPE hiring_likelihood_enum AS ENUM ('definitely', 'likely', 'possibly', 'requiring consultation');
  CREATE TYPE mission_status_enum AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
  CREATE TYPE bid_status_enum AS ENUM ('pending', 'considering', 'accepted', 'rejected', 'cancelled');
  CREATE TYPE notification_type_enum AS ENUM ('general', 'new_bid', 'bid_status_update', 'bid_rejected', 'bid_accepted', 'job_cancelled', 'new_review', 'new_message');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  -- Removed NOT NULL constraint from last_name to make it optional for homeowners
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  postal_code VARCHAR(20),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  password VARCHAR(255) NOT NULL,
  role role_enum NOT NULL,
  company_name VARCHAR(255),
  website VARCHAR(255),
  company_size company_size_enum,
  business_address VARCHAR(255),
  business_city VARCHAR(100),
  business_region VARCHAR(100),
  business_country VARCHAR(100),
  business_postal_code VARCHAR(20),
  services TEXT[] DEFAULT '{}',
  address VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  -- Removed NOT NULL constraint from country to make it optional for homeowners
  country VARCHAR(100) DEFAULT 'Canada',
  notification_frequency VARCHAR(20) DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly')),
  radius_km INTEGER,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP,
  verification_code VARCHAR(6),
  terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  terms_accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  google_places_id VARCHAR(255),
  google_rating DECIMAL(2,1),
  google_review_count INTEGER DEFAULT 0,
  google_reviews_last_synced TIMESTAMP,
  available_bids INTEGER DEFAULT 1,
  total_bids INTEGER DEFAULT 0,
  social_links JSONB DEFAULT '[]'::JSONB,
  review_sites JSONB DEFAULT '[]'::JSONB,
  external_reviews JSONB,
  last_scrape_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logo_url TEXT,
  profile_photo_url TEXT,
  agent_photo_url TEXT,
  reset_token VARCHAR(255),
  google_refresh_token TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  CONSTRAINT check_bids_non_negative CHECK (available_bids >= 0 AND total_bids >= 0)
);

ALTER TABLE users
  ADD CONSTRAINT users_phone_key UNIQUE (phone_number);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(is_banned);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);

-- Ensure phone_number is NOT NULL and has unique constraint
ALTER TABLE users 
  ALTER COLUMN phone_number SET NOT NULL,
  ADD CONSTRAINT users_phone_number_unique UNIQUE (phone_number);

-- Ensure terms_accepted and terms_accepted_at are NOT NULL
ALTER TABLE users 
  ALTER COLUMN terms_accepted SET NOT NULL,
  ALTER COLUMN terms_accepted SET DEFAULT TRUE,
  ALTER COLUMN terms_accepted_at SET NOT NULL,
  ALTER COLUMN terms_accepted_at SET DEFAULT CURRENT_TIMESTAMP;

-- Removed "SET NOT NULL" from country - now only sets default
ALTER TABLE users 
  ALTER COLUMN country SET DEFAULT 'Canada';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_business_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_business_url 
ON users(google_business_url);

-- Add hero_heading_variation for A/B testing
ALTER TABLE users ADD COLUMN IF NOT EXISTS hero_heading_variation VARCHAR(10);
CREATE INDEX IF NOT EXISTS idx_users_hero_heading ON users(hero_heading_variation);

-- Add temp contractor account columns for cold outreach
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_postal_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_services TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_temp_account BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_account_created_at TIMESTAMP;

-- Make all personal data columns nullable to support temp accounts
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE users ALTER COLUMN postal_code DROP NOT NULL;
ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Indexes for temp account lookups
CREATE INDEX IF NOT EXISTS idx_users_temp_email ON users(temp_email) WHERE temp_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_temp_account ON users(is_temp_account) WHERE is_temp_account = TRUE;
