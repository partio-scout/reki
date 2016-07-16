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

function clearTemporaryTables() {
  function clearTable(model) {
    const destroyAll = Promise.promisify(app.models[model].destroyAll, { context: app.models[model] });
    return destroyAll();
  }

  return Promise.each(modelsToClear, model => clearTable(model));
}

if (require.main === module) {
  clearTemporaryTables()
    .then(() => console.log(`Tables ${modelsToClear} cleared.`))
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Temporary model creation failed: ', err);
      process.exit(1);
    });
}
