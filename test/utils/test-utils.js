import app from '../../src/server/server';
import * as Promise from 'bluebird';
import { expect } from 'chai';

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

export function deleteFixtureIfExists(modelName, id) {
  const del = Promise.promisify(app.models[modelName].destroyById, { context: app.models[modelName] });
  return del(id);
}

export function deleteFixturesIfExist(modelName, whereClause) {
  const del = Promise.promisify(app.models[modelName].destroyAll, { context: app.models[modelName] });
  return del(whereClause);
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
