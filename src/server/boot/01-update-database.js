import Sequelize from 'sequelize'
import { sequelize, models } from '../models'
import config from '../conf'
import { appConfig } from '../server'
import argon2 from 'argon2'

// TODO refactor this to a script file and add tests to check models and roles are
// created correctly
export default async function () {
  await sequelize.sync({ alter: true })

  const roles = []
  // Create roles unless they already exist
  const rolesInConfig = config
    .getRoles()
    .map((roleName) => ({ name: roleName }))
  for (const role of rolesInConfig) {
    const [dbRole] = await models.UserRole.findOrCreate({ where: role })
    roles.push(dbRole)
  }

  if (appConfig.isDev) {
    const adminEmail = 'admin@example.com'
    const [user] = await models.User.findOrCreate({
      where: {
        email: adminEmail,
      },
      defaults: {
        firstName: 'Admin',
        lastName: 'McAdmin',
        memberNumber: '123',
        phoneNumber: '123',
        blocked: false,
        email: adminEmail,
        passwordHash: await argon2.hash('admin'),
      },
    })
    user.setRoles(roles)
  }

  // Destroy roles that are not in the config
  await models.UserRole.destroy({
    where: {
      name: { [Sequelize.Op.notIn]: config.getRoles() },
    },
  })
}
