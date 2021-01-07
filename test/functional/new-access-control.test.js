import * as testUtils from '../utils/test-utils'
import { configureApp } from '../../src/server/server'
import {
  initializeSequelize,
  initializeModels,
  resetDatabase,
  Models,
} from '../../src/server/models'

const sequelize = initializeSequelize()
const models = initializeModels(sequelize)
const app = configureApp(false, true, sequelize, models)

describe('Role-Based Access Control', () => {
  before(() => resetDatabase(sequelize, models))

  let testUser

  beforeEach(() =>
    resetDatabase(sequelize, models)
      .then(() => testUtils.createUserWithRoles(models, ['registryUser']))
      .then((user) => {
        testUser = user
      }),
  )
  afterEach(() => testUtils.deleteUsers(models))

  it('should succeed when user has permission', async () => {
    const res = await testUtils.getWithUser(
      app,
      '/api/test/rbac-test-success',
      testUser,
    )
    testUtils.expectStatus(res.status, 200)
  })

  it('should return 401 when user has no permission', async () => {
    const res = await testUtils.getWithUser(
      app,
      '/api/test/rbac-test-fail',
      testUser,
    )
    testUtils.expectStatus(res.status, 401)
  })
})
