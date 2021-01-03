import { expect } from 'chai'
import {
  withFixtures,
  deleteUsers,
  getWithUser,
  expectStatus,
  createUserWithRoles as createUser,
} from '../utils/test-utils'
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

describe('Options API endpoint', () => {
  it('returns filter options', async () => {
    const res = await getWithUser(
      app,
      '/api/options',
      await createUser(models, ['registryUser']),
    )
    expectStatus(res.status, 200)

    expect(res.body.village).to.deep.equal(['Mallikylä', 'muu'])
    expect(res.body.campGroup).to.deep.equal(['muu'])
  })

  before(() => resetDatabase(sequelize, models))
  withFixtures(models, {
    Option: [
      {
        property: 'village',
        value: 'Mallikylä',
      },
      {
        property: 'village',
        value: 'muu',
      },
      {
        property: 'campGroup',
        value: 'muu',
      },
    ],
  })
  afterEach(() => deleteUsers(models))
})
