import Sequelize from 'sequelize';
import app from '../../src/server/server.js';
import { expect } from 'chai';
import { models } from '../../src/server/models';
import request from 'supertest';
import argon2 from 'argon2';

// Counter for generating e.g. unique users automatically
let uniqueIdCounter = 1;

// Functions for managing users in tests

export async function createUserWithRoles(rolesToAdd, overrides) {
  const password = overrides && overrides.password || 'salasana';
  const passwordHash = await argon2.hash(password);
  uniqueIdCounter++;
  const userData = Object.assign({
    'username': `testuser${uniqueIdCounter}`,
    'memberNumber': String(100000 + uniqueIdCounter),
    'email': `test${uniqueIdCounter}@example.org`,
    'passwordHash': passwordHash,
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  }, overrides);

  const [roles, user] = await Promise.all([
    getRolesByName(rolesToAdd),
    createFixture('User', userData),
  ]);

  await addRolesToUser(roles, user);

  const userModel = models.User.toClientFormat(user);

  // The password on the returned user object is hashed, to be able to access the actual
  // password later on, we set it here
  userModel.clearPassword = password;
  return userModel;
}

function getRolesByName(roleNames) {
  if (roleNames.length) {
    return models.UserRole.findAll({ where: { name: { [Sequelize.Op.in]: roleNames } } });
  } else {
    return [];
  }
}

function addRolesToUser(roles, user) {
  return user.setRoles(roles);
}

export async function deleteUsers() {
  return deleteFixturesIfExist('User');
}

// Functions for creating and deleting fixtures

export function createFixture(modelName, fixture) {
  if (Array.isArray(fixture)) {
    return models[modelName].bulkCreate(fixture);
  } else {
    return models[modelName].create(fixture);
  }
}

export function deleteFixtureIfExists(modelName, id) {
  return models[modelName].destroyById(id);
}

export async function deleteFixturesIfExist(modelName, whereClause) {
  return models[modelName].destroy({ where: whereClause || {} });
}

export async function withFixtures(fixtures) {
  beforeEach(async () => {
    for (const model in fixtures) {
      await createFixture(model, fixtures[model]);
    }
  });

  afterEach(async () => {
    for (const model in fixtures) {
      await deleteFixturesIfExist(model);
    }
  });
}

// Functions for API requests

export async function getWithUser(path, user) {
  return request(app).get(path).auth(user.email, user.clearPassword);
}

export async function postWithUser(path, user, data) {
  return request(app).post(path).auth(user.email, user.clearPassword).send(data);
}

export async function deleteWithUser(path, user) {
  return request(app).delete(path).auth(user.email, user.clearPassword);
}

export function expectStatus(status, expectedStatus) {
  expect(status).to.equal(expectedStatus, `Expected HTTP status of ${expectedStatus}, got ${status}`);
}
