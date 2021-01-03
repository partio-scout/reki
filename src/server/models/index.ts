import Sequelize from 'sequelize'
import * as config from '../conf'
import argon2 from 'argon2'

import appModels, { AppModels } from './app-models'
import integrationModels, {
  IntegrationModels,
} from './kuksa-integration-models'

export type Models = AppModels & IntegrationModels
export type ModelInstances = { [K in keyof Models]: InstanceType<Models[K]> }

export function initializeSequelize() {
  const dbUrl =
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL
  return new Sequelize.Sequelize(dbUrl!, {
    logging: false,
  })
}

export function initializeModels(sequelize: Sequelize.Sequelize): Models {
  return Object.assign({}, integrationModels(sequelize), appModels(sequelize))
}

export async function resetDatabase(
  sequelize: Sequelize.Sequelize,
  models: Models,
): Promise<void> {
  await sequelize.sync({ force: true })

  // Create roles
  const roles = config.roles.map((roleName) => ({ name: roleName }))
  await Promise.all(roles.map((role) => models.UserRole.create(role)))
}

export const updateDatabase = async (
  sequelize: Sequelize.Sequelize,
  models: Models,
  isDev: boolean,
) => {
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
