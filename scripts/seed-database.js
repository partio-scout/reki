import EventEmitter from 'events';
import { sequelize } from '../src/server/models';

EventEmitter.prototype._maxListeners = 20;

export async function resetDatabase() {
  await sequelize.sync({ force: true });
}

// Run resetDatabase if this file is run as a script, but not when it has been imported.
// When running as a script we need to disconnect database connections to allow the
// process to exit.
if (require.main === module) {
  resetDatabase()
    .catch(err => console.error('Database reset and seeding failed: ', err))
    .finally(() => { sequelize.close(); });
}
