import Promise from 'bluebird';
import { getModelCreationList } from '../../common/models-list';
import { sequelize } from '../models';

export default function(server, cb) {
  if (!server.get('standalone')) {
    return cb();
  }

  const db = server.datasources.db;
  const isActual = Promise.promisify(db.isActual, { context: db });

  const modelsToUpdate = getModelCreationList();

  db.setMaxListeners(40);
  isActual(modelsToUpdate)
    .then(actual => actual
      ? console.log('Database models are up to date.')
      : db.autoupdate(modelsToUpdate).then(() => console.log(`Models: ${modelsToUpdate} updated.`)))
    .catch(err => { console.error(`Error: ${err} when autoupdating models: ${modelsToUpdate}`); return Promise.reject(err); })
    .then(() => sequelize.sync())
    .asCallback(cb);
}
