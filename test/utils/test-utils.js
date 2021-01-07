import Sequelize from 'sequelize'
import { expect } from 'chai'
import request from 'supertest'
import argon2 from 'argon2'

// Counter for generating e.g. unique users automatically
let uniqueIdCounter = 1

// Functions for managing users in tests

export async function createUserWithRoles(models, rolesToAdd, overrides) {
  const password = (overrides && overrides.password) || 'salasana'
  const passwordHash = await argon2.hash(password)
  uniqueIdCounter++
  const userData = Object.assign(
    {
      username: `testuser${uniqueIdCounter}`,
      memberNumber: String(100000 + uniqueIdCounter),
      email: `test${uniqueIdCounter}@example.org`,
      passwordHash: passwordHash,
      firstName: 'Testi',
      lastName: 'Testailija',
      phoneNumber: 'n/a',
    },
    overrides,
  )

  const [roles, user] = await Promise.all([
    getRolesByName(models, rolesToAdd),
    createFixture(models, 'User', userData),
  ])

  await addRolesToUser(roles, user)

  const userModel = models.User.toClientFormat(user)

  // The password on the returned user object is hashed, to be able to access the actual
  // password later on, we set it here
  userModel.clearPassword = password
  return userModel
}

function getRolesByName(models, roleNames) {
  if (roleNames.length) {
    return models.UserRole.findAll({
      where: { name: { [Sequelize.Op.in]: roleNames } },
    })
  } else {
    return []
  }
}

function addRolesToUser(roles, user) {
  return user.setRoles(roles)
}

export async function deleteUsers(models) {
  return deleteFixturesIfExist(models, 'User')
}

// Functions for creating and deleting fixtures

export function createFixture(models, modelName, fixture) {
  if (Array.isArray(fixture)) {
    return models[modelName].bulkCreate(fixture)
  } else {
    return models[modelName].create(fixture)
  }
}

export async function createFixtures(models, fixtures) {
  for (const [model, fixture] of Object.entries(fixtures)) {
    await createFixture(models, model, fixture)
  }
}

export function deleteFixtureIfExists(models, modelName, id) {
  return models[modelName].destroyById(id)
}

export async function deleteFixturesIfExist(models, modelName, whereClause) {
  return models[modelName].destroy({ where: whereClause || {} })
}

export async function deleteAllFixtures(models) {
  for (const model of Object.keys(models)) {
    // Don't delete UserRoles as those are only created on app startup
    if (model !== 'UserRole') {
      await deleteFixturesIfExist(models, model)
    }
  }
}

export async function withFixtures(models, fixtureParam) {
  let fixtures

  beforeEach(async () => {
    // allow passing in a function, for example
    // if fixtures need a valid user id, create a user
    // in the promise and return fixtures using that id
    fixtures =
      typeof fixtureParam === 'function' ? await fixtureParam() : fixtureParam

    await createFixtures(models, fixtures)
  })

  afterEach(async () => {
    for (const model in fixtures) {
      await deleteFixturesIfExist(models, model)
    }

    fixtures = null
  })
}

// Functions for API requests

export async function getWithUser(app, path, user) {
  return request(app).get(path).auth(user.email, user.clearPassword)
}

export async function postWithUser(app, path, user, data) {
  return request(app).post(path).auth(user.email, user.clearPassword).send(data)
}

export async function deleteWithUser(app, path, user) {
  return request(app).delete(path).auth(user.email, user.clearPassword)
}

export function expectStatus(status, expectedStatus) {
  expect(status).to.equal(
    expectedStatus,
    `Expected HTTP status of ${expectedStatus}, got ${status}`,
  )
}
