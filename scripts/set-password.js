import argon2 from 'argon2'
import { models } from '../src/server/models'

function printHelp() {
  console.log('set-password.js <email of the user to set password> <password>')
  process.exit(1)
}

const args = process.argv

if (args.length < 3) {
  console.error('Please specify the user to set password.')
  printHelp()
} else if (args.length < 4) {
  console.error('Please specify password.')
  printHelp()
}

const email = args[2]
const password = args[3]

Promise.all([models.User.findOne({ where: { email } }), argon2.hash(password)])
  .then(([user, passwordHash]) => {
    if (user) {
      return user.update({ passwordHash })
    } else {
      throw new Error(`Couldn't find user with email ${email}!`)
    }
  })
  .then(() => {
    console.log(`Password set for user ${email}.`)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
