import Sequelize from 'sequelize'
import integrationModels from './kuksa-integration-models.js'
import appModels from './app-models.js'

const dbUrl =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL
const db = new Sequelize(dbUrl, {
  logging: false,
})

export const sequelize = db
export const models = Object.assign({}, integrationModels(db), appModels(db))
