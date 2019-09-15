import Sequelize from 'sequelize';
import { sequelize, models } from '../models';
import config from '../conf';

// TODO refactor this to a script file and add tests to check models and roles are
// created correctly
export default async function(app) {
  if (!app.get('standalone')) {
    return;
  }

  await sequelize.sync({ alter: true });

  // Create roles unless they already exist
  const rolesInConfig = config.getRoles().map(roleName => ({ name: roleName }));
  for (const role of rolesInConfig) {
    await models.UserRole.findOrCreate({ where: role });
  }

  // Destroy roles that are not in the config
  await models.UserRole.destroy({
    where: {
      name: { [Sequelize.Op.notIn]: config.getRoles() },
    },
  });
}
