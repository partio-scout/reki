import Promise from 'bluebird';
import app from '../src/server/server.js';
import inquirer from 'inquirer';

const RegistryUser = app.models.RegistryUser;
const findUser = Promise.promisify(RegistryUser.findOne, { context: RegistryUser });
const destroyUserById = Promise.promisify(RegistryUser.destroyById, { context: RegistryUser });

const opts = require('commander')
  .usage('<email of the user to delete>')
  .parse(process.argv);

if (opts.args.length < 1) {
  opts.outputHelp();
  console.error('Please specify the user to delete.');
  process.exit(1);
}

function promptToDelete(user) {
  const questions = [
    {
      type: 'confirm',
      name: 'delete',
      message: `Delete the following user:\n \
      Name: ${user.firstName} ${user.lastName}\n \
      Member number: ${user.memberNumber}\n \
      Email: ${user.email}`,
    },
  ];

  inquirer.prompt(questions)
    .then(answers => {
      if (answers.delete) {
        destroyUserById(user.getId())
          .then(() => {
            console.log(`Deleted user with email ${user.email}`);
            process.exit(0);
          });
      } else {
        console.log('Command canceled');
        process.exit(0);
      }
    });
}
Promise.promisify(promptToDelete);

function printErrorMessage(err) {
  // Koska template literalit on multiline, alla oleva sisennys on tarkoituksenmukaista
  console.error(`Could not delete user:
    ${err.stack}`);
}

findUser({ where: { email: opts.args[0] } })
  .then(user => {
    if (user){
      console.log(opts.args[0]);
      promptToDelete(user);
    } else {
      console.error('No such user');
    }
  })
  .catch(err => {
    printErrorMessage(err);
    process.exit(1);
  });
