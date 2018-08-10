import { models } from '../../src/server/models';

export function createFixtureSequelize(modelName, fixture) {
  return models[modelName].bulkCreate(fixture);
}

export function deleteFixtureIfExistsSequelize(modelName, id) {
  return models[modelName].destroyById(id);
}

export function deleteFixturesIfExistSequelize(modelName, whereClause = { where: {} }) {
  return models[modelName].destroy(whereClause);
}
