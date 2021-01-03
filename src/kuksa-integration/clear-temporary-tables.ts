import { withSpinner } from './util'
import {
  initializeSequelize,
  initializeModels,
  Models,
} from '../../src/server/models'

const modelsToClear: ReadonlyArray<keyof Models> = [
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

async function clearTemporaryTables(models: Models) {
  withSpinner(async () => {
    for (const model of modelsToClear) {
      await models[model].destroy({ where: {} })
    }
  })
}

if (require.main === module) {
  const sequelize = initializeSequelize()
  const models = initializeModels(sequelize)
  clearTemporaryTables(models)
    .then(() => console.log(`Tables ${modelsToClear} cleared.`))
    .then(() => {
      process.exit(0)
    })
    .catch((err) => {
      console.error('Temporary model creation failed: ', err)
      process.exit(1)
    })
}
