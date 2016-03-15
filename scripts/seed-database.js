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
    .then(fixtureData => createModel(fixtureData));
}

// Pikkukikka joka suorittaa promiseReturningFunctionin peräkkäin jokaiselle values-listan jäsenelle niin,
// että promiseReturningFunctioneja on vain yksi suorituksessa kerrallaan.
// Palauttaa tyhjän resolved-tilassa olevan promisen jos values-lista on tyhjä.
function forAll(values, promiseReturningFunction) {
  return values.reduce((cur, next) => cur.then(() => promiseReturningFunction(next)), Promise.resolve());
}

export function resetDatabase() {
  const db = app.datasources.db;

  const modelsToCreate = getModelCreationList();
  return db.automigrate(modelsToCreate)
    .then(() => forAll(getFixtureCreationList(), createFixtures))
    .catch(err => Promise.reject(err));
}

// Ajetaan resetDatabase jos tiedosto ajetaan skriptinä, ei silloin kun importataan
// Tällöin suljetaan yhteys tietokantaan lopuksi
if (require.main === module) {
  const db = app.datasources.db;

  resetDatabase()
    .then(() => db.disconnect());
    .catch(err => console.error('Database reset and seeding failed: ', err); db.disconnect(););
}
