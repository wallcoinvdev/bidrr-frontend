import bcrypt from "bcryptjs"

// Change this to your desired admin password
const desiredPassword = "AdminPass123!"

async function generateHash() {
  const saltRounds = 10
  const hash = await bcrypt.hash(desiredPassword, saltRounds)

  console.log("==================================")
  console.log("ADMIN PASSWORD HASH GENERATED")
  console.log("==================================")
  console.log("Password:", desiredPassword)
  console.log("Hash:", hash)
  console.log("==================================")
  console.log("\nRun this SQL command to update the admin password:")
  console.log(`\nUPDATE users SET password = '${hash}' WHERE email = 'admin@bidrr.ca';\n`)
}

generateHash()
