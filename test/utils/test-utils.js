import app from '../../src/server/server';
import Promise from 'bluebird';
import _ from 'lodash';
import { expect } from 'chai';
import { models } from '../../src/server/models';
import request from 'supertest';

export function loginUser(username, userpass) {
  userpass = userpass || 'salasana';
  const promiseUserLogin = Promise.promisify(app.models.RegistryUser.login, { context: app.models.RegistryUser });
  return promiseUserLogin({
    username: username,
    password: userpass,
  });
}

export function createFixture(modelName, fixture) {
  const create = Promise.promisify(app.models[modelName].create, { context: app.models[modelName] });
  return create(fixture);
}

export function createFixtureSequelize(modelName, fixture) {
  return models[modelName].bulkCreate(fixture);
}

export function createUserWithRoles(rolesToAdd, userData) {
  return Promise.join(
    getRolesByName(rolesToAdd),
    createFixture('RegistryUser', userData),
    addRolesToUser);
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

  return createFixture('RoleMapping', roleMappings).then(() => user);
}

export function createUserAndGetAccessToken(roles, overrides) {
  const userData = {
    'username': 'testuser',
    'memberNumber': '7654321',
    'email': 'testi@example.org',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  };
  Object.assign(userData, overrides);
  return createUserWithRoles(roles, userData).then(() => loginUser(userData.username, userData.password));
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

export function getWithRoles(path, roleNames) {
  return createUserAndGetAccessToken(roleNames)
    .then(token => request(app).get(path).set('Authorization', token.id));
}

export function expectStatus(status, expectedStatus) {
  expect(status).to.equal(expectedStatus, `Expected HTTP status of ${expectedStatus}, got ${status}`);
}
