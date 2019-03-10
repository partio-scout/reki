import app from '../../src/server/server';
import Promise from 'bluebird';
import _ from 'lodash';
import { expect } from 'chai';
import { models } from '../../src/server/models';
import request from 'supertest';

// Counter for generating e.g. unique users automatically
let uniqueIdCounter = 1;

export function createFixture(modelName, fixture) {
  const create = Promise.promisify(app.models[modelName].create, { context: app.models[modelName] });
  return create(fixture);
}

export function createFixtureSequelize(modelName, fixture) {
  if (Array.isArray(fixture)) {
    return models[modelName].bulkCreate(fixture);
  } else {
    return models[modelName].create(fixture);
  }
}

export async function createUserWithRoles(rolesToAdd, overrides) {
  uniqueIdCounter++;
  const userData = Object.assign({
    'username': `testuser${uniqueIdCounter}`,
    'memberNumber': String(100000 + uniqueIdCounter),
    'email': `test${uniqueIdCounter}@example.org`,
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  }, overrides);

  const [roles, user] = await Promise.all([getRolesByName(rolesToAdd), createFixture('RegistryUser', userData)]);

  await addRolesToUser(roles, user);

  // The password on the returned user object is hashed, to be able to access the actual
  // password later on, we set it here
  user.clear_password = userData.password;
  return user;
}

function getRolesByName(roleNames) {
  return find('Role', { name: { inq: roleNames } });
}

function addRolesToUser(roles, user) {
  const roleMappings = _.map(roles, role => ({
    'principalType': 'USER',
    'principalId': user.id,
    'roleId': role.id,
  }));

  return createFixture('RoleMapping', roleMappings);
}

export function createUserAndGetAccessToken(roles, overrides) {
  return createUserWithRoles(roles, overrides).then(user => user.createAccessToken(1000));
}

export function deleteFixtureIfExists(modelName, id) {
  const del = Promise.promisify(app.models[modelName].destroyById, { context: app.models[modelName] });
  return del(id);
}

export function deleteFixtureIfExistsSequelize(modelName, id) {
  return models[modelName].destroyById(id);
}

export function deleteFixturesIfExist(modelName, whereClause) {
  const del = Promise.promisify(app.models[modelName].destroyAll, { context: app.models[modelName] });
  return del(whereClause);
}

export function deleteFixturesIfExistSequelize(modelName, whereClause = { where: {} }) {
  return models[modelName].destroy(whereClause);
}

export function expectModelToBeDeleted(modelName, id, cb) {
  const find = Promise.promisify(app.models[modelName].findById, { context: app.models[modelName] });
  return find(id).then(res => {
    expect(res).to.be.null;
  }).asCallback(cb);
}

export function find(modelName, whereClause, includeClause) {
  const what = { where: whereClause, include: includeClause };
  const find = Promise.promisify(app.models[modelName].find, { context: app.models[modelName] });
  return find(what);
}

export async function getWithUser(path, user) {
  return request(app).get(path).auth(user.email, user.clear_password);
}

export async function postWithUser(path, user, data) {
  return request(app).post(path).auth(user.email, user.clear_password).send(data);
}

export async function deleteWithUser(path, user) {
  return request(app).delete(path).auth(user.email, user.clear_password);
}

export function expectStatus(status, expectedStatus) {
  expect(status).to.equal(expectedStatus, `Expected HTTP status of ${expectedStatus}, got ${status}`);
}
