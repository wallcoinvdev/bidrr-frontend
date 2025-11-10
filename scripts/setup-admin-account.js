import bcrypt from "bcryptjs"

// This script generates a bcrypt hash and outputs SQL to create an admin account
const password = "123456"
const email = "admin@bidrr.com"

async function setupAdmin() {
  console.log('[v0] Generating bcrypt hash for password "123456"...')
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  console.log("[v0] ✅ Hash generated successfully!")
  console.log("[v0] Hash:", hashedPassword)
  console.log("\n[v0] Copy and paste this SQL command into your database:\n")

  const sqlCommand = `
INSERT INTO users (email, password_hash, full_name, role, phone_verified, created_at, updated_at)
VALUES ('${email}', '${hashedPassword}', 'Admin User', 'admin', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE 
SET password_hash = '${hashedPassword}',
    role = 'admin',
    updated_at = NOW();
`

  console.log(sqlCommand)
  console.log("[v0] This will create or update the admin account with:")
  console.log("[v0] Email: admin@bidrr.com")
  console.log("[v0] Password: 123456")
  console.log("[v0] ⚠️ Remember to change this password after logging in!")
}

setupAdmin()
