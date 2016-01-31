import path from 'path';

import app from '../src/server/server';
import { getModelCreationList, getFixtureCreationList } from '../src/common/models-list';

function getFixtures(modelName) {
  return require(path.resolve(`../src/common/fixtures/${modelName}.json`));
}

function createFixtures(modelName) {
  const fixtureData = getFixtures(modelName);
  const model = app.models[modelName];

  return model.create(fixtureData)
    .then(() => console.log(`Created ${fixtureData.length} fixtures for model ${modelName}`),
          () => console.error(`Fixture creation for model ${modelName} failed.`));
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
