import * as config from '../src/server/conf'
import { models } from '../src/server/models'
import crypto from 'crypto'
import inquirer from 'inquirer'

const password = crypto.randomBytes(24).toString('hex')
const questions = [
  {
    type: 'input',
    name: 'firstName',
    message: 'First name?',
  },
  {
    type: 'input',
    name: 'lastName',
    message: 'Last name?',
  },
  {
    type: 'input',
    name: 'memberNumber',
    message: 'Member number?',
  },
  {
    type: 'input',
    name: 'phoneNumber',
    message: 'Phone number?',
  },
  {
    type: 'input',
    name: 'email',
    message: 'Email?',
  },
  {
    type: 'checkbox',
    name: 'roles',
    message: 'Choose the roles this user should have',
    choices: config.roles.map((role) => ({
      name: role,
      value: role,
    })),
  },
]

function printErrorMessage(err) {
  console.error(`Could not create user:
    ${err.stack}`)
}

inquirer
  .prompt(questions)
  .then(async (answers) => {
    const roleNames = answers.roles
    delete answers.roles

    const user = await models.User.create(
      Object.assign({ password: password }, answers),
    )
    const roles = (
      await Promise.all(
        roleNames.map((roleName) =>
          models.UserRole.findOrCreate({ where: { name: roleName } }),
        ),
      )
    ).map((tuple) => tuple[0])

    await user.setRoles(roles)
    console.log(
      `Created user with id ${user.id} with roles ${roleNames.join(', ')}`,
    )
    process.exit(0)
  })
  .catch((err) => {
    printErrorMessage(err)
    process.exit(1)
  })
