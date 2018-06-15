import Promise from 'bluebird';
import { getModelCreationList } from '../../common/models-list';
import { sequelize } from '../models';
import config from '../conf';

// TODO refactor this to a script file and add tests to check models and roles are
// created correctly
export default function(app, cb) {
  if (!app.get('standalone')) {
    return cb();
  }

  const db = app.datasources.db;
  const isActual = Promise.promisify(db.isActual, { context: db });

  const modelsToUpdate = getModelCreationList();

  db.setMaxListeners(40);
  isActual(modelsToUpdate)
    .then(actual => actual
      ? console.log('Database models are up to date.')
      : db.autoupdate(modelsToUpdate).then(() => console.log(`Models: ${modelsToUpdate} updated.`)))
    .catch(err => { console.error(`Error: ${err} when autoupdating models: ${modelsToUpdate}`); return Promise.reject(err); })
    .then(() => sequelize.sync({ alter: true }))
    .then(async () => {

      // Create roles unless they already exist
      const rolesInConfig = config.getRoles().map(roleName => ({ name: roleName }));
      for (const role of rolesInConfig) {
        await app.models.Role.findOrCreate(role);
      }

      // Destroy roles that are not in the config
      await app.models.Role.destroyAll({
        // nin = not in
        name: { nin: config.getRoles() },
      });

    })
    .asCallback(cb);
}
