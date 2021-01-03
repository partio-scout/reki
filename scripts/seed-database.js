import EventEmitter from 'events'
import * as config from '../src/server/conf'
import {
  initializeSequelize,
  initializeModels,
  resetDatabase,
} from '../src/server/models'

EventEmitter.prototype._maxListeners = 20

// Run resetDatabase if this file is run as a script, but not when it has been imported.
// When running as a script we need to disconnect database connections to allow the
// process to exit.
if (require.main === module) {
  const sequelize = initializeSequelize()
  const models = initializeModels(sequelize)
  resetDatabase(sequelize, models)
    .catch((err) => console.error('Database reset and seeding failed: ', err))
    .finally(() => {
      sequelize.close()
    })
}
