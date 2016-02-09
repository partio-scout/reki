import path from 'path';
import Promise from 'bluebird';

import app from '../src/server/server';
import { getModelCreationList, getFixtureCreationList } from '../src/common/models-list';

function getFixtures(modelName) {
  return Promise.try(() => require(path.resolve(__dirname, `../src/common/fixtures/${modelName}`)));
}

function createFixtures(modelName) {
  const model = app.models[modelName];
  const createModel = Promise.promisify(model.create, { context: model });

  return getFixtures(modelName)
    .then(fixtureData => createModel(fixtureData)
      .then(() => console.log(`Created ${fixtureData.length} fixtures for model ${modelName}`)))
    .catch(err => console.error(`Fixture creation for model ${modelName} failed. ${err}`));
}

// Pikkukikka joka suorittaa promiseReturningFunctionin peräkkäin jokaiselle values-listan jäsenelle niin,
// että promiseReturningFunctioneja on vain yksi suorituksessa kerrallaan.
// Palauttaa tyhjän resolved-tilassa olevan promisen jos values-lista on tyhjä.
function forAll(values, promiseReturningFunction) {
  return values.reduce((cur, next) => cur.then(() => promiseReturningFunction(next)), Promise.resolve());
}

const db = app.datasources.db;

const modelsToCreate = getModelCreationList();
db.automigrate(modelsToCreate)
  .then(() => console.log('The following tables were (re-)created: ', modelsToCreate))
  .then(() => forAll(getFixtureCreationList(), createFixtures))
  .then(() => db.disconnect(), () => db.disconnect());
