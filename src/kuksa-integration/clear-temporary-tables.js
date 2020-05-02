import { models } from '../server/models'
import EventEmitter from 'events'
import { startSpinner } from './util'

EventEmitter.prototype._maxListeners = 20

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
]

async function clearTemporaryTables() {
  const stopSpinner = startSpinner()
  try {
    for (const model of modelsToClear) {
      await models[model].destroy({ where: {} })
    }
  } finally {
    stopSpinner()
  }
}

if (require.main === module) {
  clearTemporaryTables()
    .then(() => console.log(`Tables ${modelsToClear} cleared.`))
    .then(() => {
      process.exit(0)
    })
    .catch((err) => {
      console.error('Temporary model creation failed: ', err)
      process.exit(1)
    })
}
