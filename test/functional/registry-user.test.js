import { expect } from 'chai'
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

describe('User API endpoints', () => {
  let user

  before(() => resetDatabase(sequelize, models))
  beforeEach(createUserFixtures)
  afterEach(() => testUtils.deleteUsers(models))

  it('findAll: correctly lists all users', async () => {
    const res = await testUtils.getWithUser(app, '/api/registryusers', user)
    testUtils.expectStatus(res.status, 200)
    expect(res.body).to.be.an('array').with.length(3)
    expect(res.body[0]).to.have.property('id').to.be.above(0)
  })

  it('if user is blocked status changes in database', async () => {
    const res = await testUtils.postWithUser(
      app,
      '/api/registryusers/2/block',
      user,
      null,
    )
    testUtils.expectStatus(res.status, 204)

    const affectedUser = await models.User.findByPk(2)
    expect(affectedUser.blocked).is.true
  })

  it('unblock: updates unblocked status in database', async () => {
    const res = await testUtils.postWithUser(
      app,
      '/api/registryusers/1/unblock',
      user,
      null,
    )
    testUtils.expectStatus(res.status, 204)

    const affectedUser = await models.User.findByPk(1)
    expect(affectedUser.blocked).is.false
  })

  async function createUserFixtures() {
    await testUtils.createUserWithRoles(models, ['registryUser'], {
      id: 1,
      memberNumber: '00000000',
      email: 'user@example.com',
      password: 'salasana',
      firstName: 'Testi',
      lastName: 'Testailija',
      phoneNumber: '0000000001',
      blocked: true,
    })
    await testUtils.createUserWithRoles(models, ['registryUser'], {
      id: 2,
      memberNumber: '00000001',
      email: 'jumala@example.com',
      password: 'salasananas',
      firstName: 'Jumalan',
      lastName: 'Poika',
      phoneNumber: '0000000002',
      blocked: false,
    })
    user = await testUtils.createUserWithRoles(models, ['registryAdmin'], {
      id: 3,
      memberNumber: '00000002',
      email: 'jukka.pekka@example.com',
      password: 'salasa',
      firstName: 'Jukka',
      lastName: 'Pekka',
      phoneNumber: '0000000003',
    })
  }
})
