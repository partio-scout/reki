import { configureApp } from '../../src/server/server'
import request from 'supertest'
import {
  createUserWithRoles as createUser,
  deleteUsers,
} from '../utils/test-utils'
import { resetDatabase } from '../../scripts/seed-database'
import {
  initializeSequelize,
  initializeModels,
  Models,
} from '../../src/server/models'

const sequelize = initializeSequelize()
const models = initializeModels(sequelize)
const app = configureApp(false, true, sequelize, models)

function loginRequest(username, password) {
  return request(app).get('/login/password').auth(username, password)
}

const OK = 200
const UNAUTHORIZED = 401

describe('Login with basic auth', () => {
  before(() => resetDatabase(sequelize, models))

  beforeEach(async () => {
    await createUser(models, ['registryUser', 'registryAdmin'], {
      email: 'correct', // non-email username
      password: 'CorrectPassword1122',
    })
    await createUser(models, ['registryUser', 'registryAdmin'], {
      email: 'blocked',
      password: 'SomeCorrectPw123',
      blocked: true,
    })
    await createUser(models, ['registryUser', 'registryAdmin'], {
      email: 'correct@example.org',
      password: 'CorrectForUser3',
    })
  })

  afterEach(() => deleteUsers(models))

  it('succeeds with correct username (non-email) and correct password', async () => {
    await loginRequest('correct', 'CorrectPassword1122').expect(OK)
  })

  it('succeeds with correct username (email) and correct password', async () => {
    await loginRequest('correct@example.org', 'CorrectForUser3').expect(OK)
  })

  it('fails for blocked user with correct username and correct password', async () => {
    await loginRequest('blocked', 'SomeCorrectPw123').expect(UNAUTHORIZED)
  })

  it('fails with correct username and incorrect password', async () => {
    await loginRequest('correct', 'NotCorrect1').expect(UNAUTHORIZED)
  })

  it("fails with correct username and another user's password", async () => {
    await loginRequest('correct', 'CorrectForUser3').expect(UNAUTHORIZED)
  })

  it('fails with correct username and empty password', async () => {
    await loginRequest('correct', '').expect(UNAUTHORIZED)
  })

  it('fails with correct username and null password', async () => {
    await loginRequest('correct', null).expect(UNAUTHORIZED)
  })

  it('fails with correct username and null character password', async () => {
    await loginRequest('correct', '\0').expect(UNAUTHORIZED)
  })

  it('fails with SQL wildcard username and correct password', async () => {
    await loginRequest('%', 'CorrectPassword1122').expect(UNAUTHORIZED)
  })

  it('fails with non-existant username and existing password', async () => {
    await loginRequest('doesntexist', 'CorrectPassword1122').expect(
      UNAUTHORIZED,
    )
  })

  it('fails with non-existant username and incorrect password', async () => {
    await loginRequest('doesntexist', 'NotCorrectPw5').expect(UNAUTHORIZED)
  })

  it('fails with empty username and empty password', async () => {
    await loginRequest('', '').expect(UNAUTHORIZED)
  })

  it('fails with null character username and a correct password', async () => {
    await loginRequest('\0', 'CorrectPassword1122').expect(UNAUTHORIZED)
  })
})
