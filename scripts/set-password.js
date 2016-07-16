import Promise from 'bluebird';
import app from '../src/server/server.js';
const findUser = Promise.promisify(app.models.RegistryUser.findOne, { context: app.models.RegistryUser });

const opts = require('commander')
  .usage('<email of the user to set password> <password>')
  .parse(process.argv);

if (opts.args.length < 1) {
  console.error('Please specify the user to set password.');
  opts.help();
} else if (opts.args.length < 2) {
  console.error('Please specify password.');
  opts.help();
}

findUser({ where: { email: opts.args[0] } })
  .then(user => {
    if (user) {
      const updateUser = Promise.promisify(user.updateAttribute, { context: user });
      return updateUser('password', opts.args[1]);
    } else {
      throw new Error(`Couldn't find user with email ${opts.args[0]}!`);
    }
  })
  .then(() => {
    console.log(`Password set for user ${opts.args[0]}.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
