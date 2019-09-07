import Promise from 'bluebird';
import argon2 from 'argon2';
import { models } from '../src/server/models';

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

Promise.all([models.User.findOne({ where: { email: opts.args[0] } }), argon2.hash(opts.args[1])])
  .then(([user, passwordHash]) => {
    if (user) {
      return user.update({ passwordHash });
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
