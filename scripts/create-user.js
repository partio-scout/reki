import Promise from 'bluebird';
import app from '../src/server/server.js';
import crypto from 'crypto';

const Registryuser = app.models.Registryuser;
const createUser = Promise.promisify(Registryuser.create, { context: Registryuser });

const opts = require('commander')
  .usage('<member number> <user email>')
  .parse(process.argv);

if (opts.args.length < 2) {
  opts.outputHelp();
  console.error('Please provide the user\'s member number and email.');
  process.exit(1);
}

const memberNumber = opts.args[0];
const email = opts.args[1];
const password = crypto.randomBytes(24).toString('hex');
const user = {
  memberNumber: memberNumber,
  email: email,
  password: password,
  name: 'n/a',
  phone: 'n/a',
};

function printErrorMessage(err) {
  // Koska template literalit on multiline, alla oleva sisennys on tarkoituksenmukaista
  console.error(`Could not create user:
  ${err.stack}`);
}

createUser(user)
  .then(createdUserInfo => {
    console.log(`Created user with id ${createdUserInfo.id}`);
    process.exit(0);
  })
  .catch(err => {
    printErrorMessage(err);
    process.exit(1);
  });
