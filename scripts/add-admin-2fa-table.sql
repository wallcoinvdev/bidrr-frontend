-- Create table for admin 2FA codes
CREATE TABLE IF NOT EXISTS admin_2fa_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_2fa_user_id ON admin_2fa_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_2fa_expires ON admin_2fa_codes(expires_at);

-- Clean up expired codes older than 1 hour
DELETE FROM admin_2fa_codes WHERE expires_at < NOW() - INTERVAL '1 hour';
