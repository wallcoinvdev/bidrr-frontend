const bcrypt = require("bcryptjs")

const password = "123456"
const saltRounds = 10

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err)
    return
  }

  console.log("\n===========================================")
  console.log("BCRYPT HASH FOR PASSWORD: 123456")
  console.log("===========================================")
  console.log(hash)
  console.log("===========================================\n")
  console.log("Now run this in your psql terminal:\n")
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@bidrr.com';\n`)
})
