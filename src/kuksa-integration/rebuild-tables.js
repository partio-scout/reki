import sequelize from 'sequelize'
import { _ } from 'lodash'
import moment from 'moment'
import * as config from '../server/conf'
import { startSpinner } from './util'
import { initializeSequelize, initializeModels } from '../server/models'

const Op = sequelize.Op

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
    await buildAllergyTable(models)
    await rebuildParticipantsTable(models)
    await addAllergiesToParticipants(models)
    await addDatesToParticipants(models)
    await buildSelectionTable(models)
    await deleteCancelledParticipants(models)
    await buildOptionTable(models)
  } finally {
    sequelize.close()
    stopSpinner()
  }
}

async function buildAllergyTable(models) {
  console.log('Rebuilding allergies table...')
  const selGroups = await models.KuksaExtraSelectionGroup.findAll({
    where: {
      name: {
        [Op.in]: config.allergyFieldTitles,
      },
    },
  })
  const kuksaSelections = await models.KuksaExtraSelection.findAll({
    where: {
      kuksaExtraselectiongroupId: {
        [Op.in]: _.map(selGroups, (group) => group.id),
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

async function getWrappedParticipants(models) {
  function getExtraInfo(participant, fieldName) {
    const field = _.find(
      participant.kuksa_participantextrainfos,
      (o) => _.get(o, 'kuksa_extrainfofield.name') === fieldName,
    )
    return field ? field.value : null
  }

  function getAllExtraSelections(participant, fieldName) {
    return participant.kuksa_extraselections
      .filter((o) => _.get(o, 'kuksa_extraselectiongroup.name') === fieldName)
      .map((selection) => selection.name)
  }

  function getExtraSelection(participant, fieldName) {
    const selection = _.find(
      participant.kuksa_extraselections,
      (o) => _.get(o, 'kuksa_extraselectiongroup.name') === fieldName,
    )
    return selection ? selection.name : null
  }

  function getPaymentStatus(statuses, type) {
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
        include: models.KuksaExtraSelectionGroup,
      },
      models.KuksaParticipantPaymentStatus,
      models.KuksaPayment,
    ],
  })
  // don't add participants that are cancelled
  const activeParticipants = _.filter(participants, (p) => !p.cancelled)
  return activeParticipants.map((participant) => ({
    get: (path) => _.get(participant, path),
    getPaymentStatus: (type) =>
      getPaymentStatus(participant.kuksa_participantpaymentstatus, type),
    getExtraInfo: (field) => getExtraInfo(participant, field),
    getExtraSelection: (groupName) => getExtraSelection(participant, groupName),
    getAllExtraSelections: (groupName) =>
      getAllExtraSelections(participant, groupName),
    getPayments: () =>
      participant.kuksa_payments.map((payment) => payment.name),
    getRawFields: () => participant,
  }))
}

async function rebuildParticipantsTable(models) {
  console.log('Rebuilding participants table...')

  const wrappedParticipants = await getWrappedParticipants(models)
  const participants = wrappedParticipants.map(
    config.participantBuilderFunction,
  )
  for (const participant of participants) {
    await models.Participant.upsert(participant)
  }
  console.log('Rebuild complete.')
}

async function addAllergiesToParticipants(models) {
  async function removeOldAndAddNewAllergies(participant, newAllergies) {
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

  async function findParticipantsAllergies(participant) {
    const allergies = await models.Allergy.findAll()
    const allergyIds = _.map(allergies, 'allergyId')
    const participantsAllergies = await models.KuksaParticipantExtraSelection.findAll(
      {
        where: {
          [Op.and]: [
            { kuksaParticipantId: participant.participantId },
            { kuksaExtraselectionId: { [Op.in]: allergyIds } },
          ],
        },
      },
    )
    return _.map(participantsAllergies, 'kuksaExtraselectionId')
  }

  console.log('Adding allergies and diets to participants...')

  const participants = await models.Participant.findAll({
    include: [models.Allergy],
  })
  for (const participant of participants) {
    const allergies = await findParticipantsAllergies(participant)
    await removeOldAndAddNewAllergies(participant, allergies)
  }
  console.log('Allergies and diets added.')
}

async function addDatesToParticipants(models) {
  const participantDatesMapper = config.participantDatesMapper

  console.log('Adding dates to participants...')
  const wrappedParticipants = await getWrappedParticipants(models)
  for (const wrappedParticipant of wrappedParticipants) {
    await models.ParticipantDate.destroy({
      where: { participantId: wrappedParticipant.get('id') },
    })
    await models.ParticipantDate.bulkCreate(
      mapPaymentsToDates(wrappedParticipant),
    )
  }

  function mapPaymentsToDates(wrappedParticipant) {
    const participantId = wrappedParticipant.get('id')

    return _(participantDatesMapper(wrappedParticipant))
      .uniq()
      .sort()
      .map((date) => ({
        participantId: participantId,
        date: moment(date).toDate(),
      }))
      .value()
  }
}

async function buildSelectionTable(models) {
  const groupsToCreate = config.selectionGroupTitles

  console.log('Building selections table...')

  await models.Selection.destroy({ where: {} })
  const participants = await models.Participant.findAll()
  for (const p of participants) {
    const participantSelections = await models.KuksaParticipantExtraSelection.findAll(
      {
        where: { kuksaParticipantId: p.participantId },
        include: {
          model: models.KuksaExtraSelection,
          include: [models.KuksaExtraSelectionGroup],
        },
      },
    )
    const selections = participantSelections
      .filter(
        (s) =>
          !!(
            s.kuksa_extraselection &&
            s.kuksa_extraselection.kuksa_extraselectiongroup
          ),
      ) // Apparently some selections don't have a group, so handle only selections with group
      .filter(
        (s) =>
          _.indexOf(
            groupsToCreate,
            s.kuksa_extraselection.kuksa_extraselectiongroup.name,
          ) > -1,
      )
      .map((sel) => ({
        participantParticipantId: sel.kuksaParticipantId,
        kuksaGroupId: sel.kuksa_extraselection.kuksa_extraselectiongroup.id,
        kuksaSelectionId: sel.kuksa_extraselection.id,
        groupName: sel.kuksa_extraselection.kuksa_extraselectiongroup.name.trim(),
        selectionName: sel.kuksa_extraselection.name,
      }))
    await models.Selection.bulkCreate(selections)
  }
  console.log('Selections table built.')
}

async function deleteCancelledParticipants(models) {
  console.log('Deleting cancelled participants...')
  const participants = await models.KuksaParticipant.findAll({
    where: { cancelled: true },
  })
  const idsToDelete = _.map(participants, 'id')
  const count = await models.Participant.destroy({
    where: { participantId: { [Op.in]: idsToDelete } },
  })
  console.log(`Deleted ${count} cancelled participants.`)
}

async function buildOptionTable(models) {
  await models.Option.destroy({ where: {} })
  for (const field of config.optionFieldNames) {
    const values = await models.Participant.aggregate(field, 'DISTINCT', {
      plain: false,
    })

    for (const value of _(values)
      .map((obj) => obj['DISTINCT'])
      .uniq()
      .reject(_.isNull)
      .value()
      .sort()) {
      await models.Option.create({ property: field, value: value })
    }
  }
}
