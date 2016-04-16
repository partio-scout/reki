import Promise from 'bluebird';
import app from '../src/server/server.js';
import crypto from 'crypto';
import inquirer from 'inquirer';

const RegistryUser = app.models.RegistryUser;
const createUser = Promise.promisify(RegistryUser.create, { context: RegistryUser });

const password = crypto.randomBytes(24).toString('hex');
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
];

function printErrorMessage(err) {
  // Koska template literalit on multiline, alla oleva sisennys on tarkoituksenmukaista
  console.error(`Could not create user:
    ${err.stack}`);
}

inquirer.prompt(questions)
  .then(answers => {
    createUser(Object.assign({ password: password }, answers))
      .then(createdUserInfo => {
        console.log(`Created user with id ${createdUserInfo.id}`);
        process.exit(0);
      })
      .catch(err => {
        printErrorMessage(err);
        process.exit(1);
      });
  });
