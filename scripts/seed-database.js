import EventEmitter from 'events';
import config from '../src/server/conf';
import { sequelize } from '../src/server/models';
import { models } from '../src/server/models';

EventEmitter.prototype._maxListeners = 20;

export async function resetDatabase() {
  await sequelize.sync({ force: true });

  // Create roles
  const roles = config.getRoles().map(roleName => ({ name: roleName }));
  await Promise.all(roles.map(role => models.UserRole.create(role)));
}

// Run resetDatabase if this file is run as a script, but not when it has been imported.
// When running as a script we need to disconnect database connections to allow the
// process to exit.
if (require.main === module) {
  resetDatabase()
    .catch(err => console.error('Database reset and seeding failed: ', err))
    .finally(() => { sequelize.close(); });
}
