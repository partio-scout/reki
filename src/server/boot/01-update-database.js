import { sequelize } from '../models';

// TODO refactor this to a script file and add tests to check models and roles are
// created correctly
export default async function(app) {
  if (!app.get('standalone')) {
    return;
  }

  await sequelize.sync({ alter: true });
}
