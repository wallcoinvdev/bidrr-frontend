import bcrypt from "bcryptjs"

// Generate hash for password "123456"
const password = "123456"
const saltRounds = 10

console.log("Generating bcrypt hash for admin password...")
const hash = await bcrypt.hash(password, saltRounds)

console.log("\n✅ Hash generated successfully!")
console.log("\nPassword:", password)
console.log("Hash:", hash)
console.log("\nUse this hash in the SQL script to create your admin account.")
