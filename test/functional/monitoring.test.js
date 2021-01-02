import { configureApp } from '../../src/server/server'
import request from 'supertest'
import { resetDatabase } from '../../scripts/seed-database'
import {
  initializeSequelize,
  initializeModels,
  Models,
} from '../../src/server/models'

const sequelize = initializeSequelize()
const models = initializeModels(sequelize)
const app = configureApp(false, true, sequelize, models)

describe('Monitoring endpoint', () => {
  beforeEach(() => resetDatabase(sequelize, models))

  it('should return ok, even for unauthenticated users', () =>
    request(app).get('/monitoring').expect(200, 'OK'))
})
