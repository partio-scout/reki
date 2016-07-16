import app from '../server/server';
import Promise from 'bluebird';
import EventEmitter from 'events';

EventEmitter.prototype._maxListeners = 20;

const modelsToClear = [
  'KuksaSubCamp',
  'KuksaVillage',
  'KuksaCampGroup',
  'KuksaLocalGroup',
  'KuksaParticipant',
  'KuksaExtraInfoField',
  'KuksaParticipantExtraInfo',
  'KuksaParticipantPaymentStatus',
  'KuksaExtraSelectionGroup',
  'KuksaExtraSelection',
  'KuksaParticipantExtraSelection',
  'KuksaPayment',
  'KuksaParticipantPayment',
];

function resetDatabase() {
  function automigrate() {
    const db = app.datasources.db;
    return new Promise((resolve, reject) => db.automigrate(modelsToClear).then(resolve, reject));
  }
  return automigrate();
}

if (require.main === module) {
  const db = app.datasources.db;

  resetDatabase()
    .then(() => console.log(`Tables ${modelsToClear} re-created.`))
    .catch(err => console.error('Temporary model creation failed: ', err))
    .finally(() => db.disconnect());
}
