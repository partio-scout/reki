import Sequelize from 'sequelize'
import * as config from '../conf'
import integrationModels from './kuksa-integration-models'
import appModels from './app-models'
import argon2 from 'argon2'

const dbUrl =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL
const db = new Sequelize.Sequelize(dbUrl!, {
  logging: false,
})

export const sequelize = db
export const models = Object.assign({}, integrationModels(db), appModels(db))

export const updateDatabase = async (isDev: boolean) => {
  await sequelize.sync({ alter: true })

  const roles = []
  // Create roles unless they already exist
  const rolesInConfig = config.roles.map((roleName) => ({ name: roleName }))
  for (const role of rolesInConfig) {
    const [dbRole] = await models.UserRole.findOrCreate({ where: role })
    roles.push(dbRole)
  }

  if (isDev) {
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
      name: { [Sequelize.Op.notIn]: config.roles as any },
    },
  })
}
