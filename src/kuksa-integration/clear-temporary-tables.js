import { models } from '../server/models';
import Promise from 'bluebird';
import EventEmitter from 'events';
import { startSpinner } from './util';

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
  return Promise.each(modelsToClear, model => models[model].destroy({ where: {} }));
}

if (require.main === module) {
  const stopSpinner = startSpinner();
  clearTemporaryTables()
    .then(() => console.log(`Tables ${modelsToClear} cleared.`))
    .then(() => {
      stopSpinner();
      process.exit(0);
    })
    .catch(err => {
      console.error('Temporary model creation failed: ', err);
      process.exit(1);
    });
}
