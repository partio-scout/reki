import { Sequelize, Op } from 'sequelize'
import _ from 'lodash'
import moment from 'moment'
import * as config from '../server/conf'
import { startSpinner } from './util'
import {
  initializeSequelize,
  initializeModels,
  Models,
  ModelInstances,
} from '../server/models'

if (require.main === module) {
  main().then(
    () => {
      console.log('Finished successfully.')
      process.exit(0)
    },
    (err) => {
      console.error(`Error: ${err}. Exiting.`)
      process.exit(1)
    },
  )
}

async function main() {
  const sequelize = initializeSequelize()
  const stopSpinner = startSpinner()
  try {
    const models = initializeModels(sequelize)
    await withProgressLogging('building allergy table', () =>
      buildAllergyTable(models),
    )
    await withProgressLogging('building participants table', () =>
      rebuildParticipantsTable(models),
    )
    await withProgressLogging('adding allergies to participants', () =>
      addAllergiesToParticipants(models),
    )
    await withProgressLogging('adding dates to participants', () =>
      addDatesToParticipants(models),
    )
    await withProgressLogging('building selection table', () =>
      buildSelectionTable(models),
    )
    await withProgressLogging('deleting cancelled participants', () =>
      deleteCancelledParticipants(models),
    )
    await withProgressLogging('building option table', () =>
      buildOptionTable(sequelize, models),
    )
  } finally {
    sequelize.close()
    stopSpinner()
  }
}

async function withProgressLogging<T>(
  message: string,
  func: () => Promise<T>,
): Promise<T> {
  console.log(message)
  const res = await func()
  console.log(`Done with: ${message}`)
  return res
}

async function buildAllergyTable(models: Models) {
  const selGroups = await models.KuksaExtraSelectionGroup.findAll({
    where: {
      name: {
        [Op.in]: config.allergyFieldTitles as any,
      },
    },
  })
  const kuksaSelections = await models.KuksaExtraSelection.findAll({
    where: {
      kuksaExtraselectiongroupId: {
        [Op.in]: selGroups.map((group) => group.id),
      },
    },
  })
  const selections = kuksaSelections.map((selection) => ({
    name: selection.name,
    allergyId: selection.id,
  }))
  for (const s of selections) {
    await models.Allergy.upsert(s)
  }
}

async function getWrappedParticipants(models: Models) {
  function getExtraInfo(
    participant: ModelInstances['KuksaParticipant'],
    fieldName: string,
  ) {
    const field = _.find(
      participant.kuksa_participantextrainfos,
      (o) => o?.kuksa_extrainfofield?.name === fieldName,
    )
    return field ? field.value : null
  }

  function getAllExtraSelections(
    participant: ModelInstances['KuksaParticipant'],
    fieldName: string,
  ) {
    return (participant.kuksa_extraselections ?? [])
      .filter((o) => o?.kuksa_extraselectiongroup?.name === fieldName)
      .map((selection) => selection.name)
  }

  function getExtraSelection(
    participant: ModelInstances['KuksaParticipant'],
    fieldName: string,
  ) {
    const selection = _.find(
      participant.kuksa_extraselections,
      (o) => _.get(o, 'kuksa_extraselectiongroup.name') === fieldName,
    )
    return selection ? selection.name : null
  }

  function getPaymentStatus(
    statuses: ModelInstances['KuksaParticipantPaymentStatus'] | undefined,
    type: 'billed' | 'paid',
  ) {
    if (!statuses) {
      return null
    }
    return statuses[type] || null
  }

  const participants = await models.KuksaParticipant.findAll({
    include: [
      {
        model: models.KuksaLocalGroup,
        include: [models.KuksaSubCamp],
      },
      models.KuksaCampGroup,
      models.KuksaSubCamp,
      models.KuksaVillage,
      {
        model: models.KuksaParticipantExtraInfo,
        include: [models.KuksaExtraInfoField],
      },
      {
        model: models.KuksaExtraSelection,
        include: [models.KuksaExtraSelectionGroup],
      },
      models.KuksaParticipantPaymentStatus,
      models.KuksaPayment,
    ],
  })
  // don't add participants that are cancelled
  const activeParticipants = _.filter(participants, (p) => !p.cancelled)
  return activeParticipants.map(
    (participant): config.WrappedParticipant => ({
      get: (path) => _.get(participant, path),
      getPaymentStatus: (type) =>
        getPaymentStatus(participant.kuksa_participantpaymentstatus, type),
      getExtraInfo: (field) => getExtraInfo(participant, field),
      getExtraSelection: (groupName) =>
        getExtraSelection(participant, groupName),
      getAllExtraSelections: (groupName) =>
        getAllExtraSelections(participant, groupName),
      getPayments: () =>
        (participant.kuksa_payments ?? []).map((payment) => payment.name),
      getRawFields: () => participant,
    }),
  )
}

async function rebuildParticipantsTable(models: Models) {
  const wrappedParticipants = await getWrappedParticipants(models)
  for (const wrappedParticipant of wrappedParticipants) {
    const participant = config.participantBuilderFunction(wrappedParticipant)
    await models.Participant.upsert(participant)
  }
}

async function addAllergiesToParticipants(models: Models) {
  async function removeOldAndAddNewAllergies(
    participant: ModelInstances['Participant'],
    newAllergies: readonly string[],
  ) {
    await models.ParticipantAllergy.destroy({
      where: { participantParticipantId: participant.participantId },
    })
    for (const allergyId of newAllergies) {
      await models.ParticipantAllergy.create({
        participantParticipantId: participant.participantId,
        allergyAllergyId: allergyId,
      })
    }
  }

  async function findParticipantsAllergies(
    participant: ModelInstances['Participant'],
  ) {
    const allergies = await models.Allergy.findAll()
    const allergyIds = _.map(allergies, 'allergyId')
    const participantsAllergies =
      await models.KuksaParticipantExtraSelection.findAll({
        where: {
          [Op.and]: [
            { kuksaParticipantId: participant.participantId },
            { kuksaExtraselectionId: { [Op.in]: allergyIds } },
          ],
        },
      })
    return _.map(participantsAllergies, 'kuksaExtraselectionId')
  }

  const participants = await models.Participant.findAll({
    include: [models.Allergy],
  })
  for (const participant of participants) {
    const allergies = await findParticipantsAllergies(participant)
    await removeOldAndAddNewAllergies(participant, allergies)
  }
}

async function addDatesToParticipants(models: Models) {
  const participantDatesMapper = config.participantDatesMapper

  const wrappedParticipants = await getWrappedParticipants(models)
  for (const wrappedParticipant of wrappedParticipants) {
    await models.ParticipantDate.destroy({
      where: { participantId: wrappedParticipant.get('id') as any },
    })
    await models.ParticipantDate.bulkCreate(
      mapPaymentsToDates(wrappedParticipant),
    )
  }

  function mapPaymentsToDates(wrappedParticipant: config.WrappedParticipant) {
    const participantId = wrappedParticipant.get('id')

    return Array.from(new Set(participantDatesMapper(wrappedParticipant)))
      .sort()
      .map((date) => ({
        participantId: participantId,
        date: moment(date).toDate(),
      }))
  }
}

async function buildSelectionTable(models: Models) {
  const groupsToCreate = config.selectionGroupTitles

  await models.Selection.destroy({ where: {} })
  const participants = await models.Participant.findAll()
  for (const p of participants) {
    const participantSelections =
      await models.KuksaParticipantExtraSelection.findAll({
        where: { kuksaParticipantId: p.participantId },
        include: [
          {
            model: models.KuksaExtraSelection,
            include: [models.KuksaExtraSelectionGroup],
          },
        ],
      })
    const selections = participantSelections
      .filter(
        (s) => s.kuksa_extraselection?.kuksa_extraselectiongroup !== undefined,
      ) // Apparently some selections don't have a group, so handle only selections with group
      .filter(
        (s) =>
          _.indexOf(
            groupsToCreate,
            s.kuksa_extraselection?.kuksa_extraselectiongroup?.name,
          ) > -1,
      )
      .map((sel) => ({
        participantParticipantId: sel.kuksaParticipantId,
        kuksaGroupId: sel.kuksa_extraselection?.kuksa_extraselectiongroup?.id,
        kuksaSelectionId: sel.kuksa_extraselection?.id,
        groupName:
          sel.kuksa_extraselection?.kuksa_extraselectiongroup?.name?.trim(),
        selectionName: sel.kuksa_extraselection?.name,
      }))
    await models.Selection.bulkCreate(selections)
  }
}

async function deleteCancelledParticipants(models: Models) {
  const participants = await models.KuksaParticipant.findAll({
    where: { cancelled: true },
  })
  const idsToDelete = _.map(participants, 'id')
  await models.Participant.destroy({
    where: { participantId: { [Op.in]: idsToDelete } },
  })
}

async function buildOptionTable(sequelize: Sequelize, models: Models) {
  await models.Option.destroy({ where: {} })
  for (const field of config.optionFieldNames) {
    await sequelize.query(
      `INSERT INTO options (property, value, "createdAt", "updatedAt") (SELECT DISTINCT '${field}' AS property, "extraFields"->>'${field}' AS value, NOW() as "createdAt", NOW() as "updatedAt" FROM participants WHERE "extraFields"->>'${field}' IS NOT NULL ORDER BY "extraFields"->>'${field}')`,
    )
  }
}
