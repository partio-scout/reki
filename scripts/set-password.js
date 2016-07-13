import Promise from 'bluebird';
import app from '../src/server/server.js';
const RegistryUser = app.models.RegistryUser;
const findOne = Promise.promisify(RegistryUser.findOne, { context: RegistryUser });

const opts = require('commander')
  .usage('<email of the user to set password> <password>')
  .parse(process.argv);
if (opts.args.length < 1) {
  opts.outputHelp();
  console.error('Please specify the user to set password.');
  process.exit(1);
}else if (opts.args.length < 2) {
  opts.outputHelp();
  console.error('Please insert password.');
  process.exit(1);
}
findOne({ where: { email: opts.args[0] } })
  .then(user => {
    user.updateAttribute('password', opts.args[1], (err => {
      if (err) {
        console.log(err);
        process.exit(1);
      } else {
        console.log('password set');
        process.exit(0);
      }
    }));
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
