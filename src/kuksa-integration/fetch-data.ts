import moment from 'moment'
import { transferModel } from './transfer'
import { getEventApi, EventApi } from 'kuksa-event-api-client'
import * as config from '../server/conf'
import { startSpinner } from './util'
import { initializeSequelize, initializeModels, Models } from '../server/models'

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
    const options = getOptionsFromEnvironment()
    const eventApi = getEventApi(options)
    await transferTablesOnlyOnce(models, eventApi)
    await transferParticipants(models, eventApi)
    await transferPayments(models, eventApi)
  } finally {
    sequelize.close()
    stopSpinner()
  }
}

function getOptionsFromEnvironment() {
  function extractEnvVar(
    environmentVariable: string,
    description: string,
  ): string {
    const value = process.env[environmentVariable]
    if (!value) {
      throw new Error(
        `Specify ${description} in the environment variable ${environmentVariable}.`,
      )
    }
    return value
  }

  return {
    endpoint: extractEnvVar(
      'KUKSA_API_ENDPOINT',
      'the endpoint url of the kuksa api',
    ),
    username: extractEnvVar(
      'KUKSA_API_USERNAME',
      'the username for the kuksa api',
    ),
    password: extractEnvVar(
      'KUKSA_API_PASSWORD',
      'the password for the kuksa api',
    ),
    eventId: extractEnvVar('KUKSA_API_EVENTID', 'the event id'),
    proxy: process.env.PROXIMO_URL || process.env.KUKSA_API_PROXY_URL, // optional
  }
}

async function transferTablesOnlyOnce(models: Models, eventApi: EventApi) {
  console.log(
    'Transferring sub camps, villages, local groups, extra selections, info fields and payments...',
  )

  await transferModel({
    getFromSource: eventApi.getSubCamps,
    targetModel: models.KuksaSubCamp,
  })
  await transferModel({
    getFromSource: eventApi.getVillages,
    targetModel: models.KuksaVillage,
    transform: (village) => ({
      id: village.id,
      subCampId: village.subCamp,
      name: village.name,
    }),
  })
  await transferModel({
    getFromSource: eventApi.getCampGroups,
    targetModel: models.KuksaCampGroup,
    transform: (campGroup) => ({
      id: campGroup.id,
      subCampId: campGroup.subCamp,
      villageId: campGroup.village,
      name: campGroup.name,
    }),
  })
  await transferModel({
    getFromSource: eventApi.getLocalGroups,
    targetModel: models.KuksaLocalGroup,
    transform: (localGroup) => ({
      id: localGroup.id,
      subCampId: localGroup.subCamp,
      villageId: localGroup.village,
      campGroupId: localGroup.campGroup,
      name: localGroup.name,
      scoutOrganization: localGroup.scoutOrganization,
      locality: localGroup.locality,
      country: localGroup.country,
      countryCode: localGroup.countryCode,
    }),
  })
  await transferModel({
    getFromSource: eventApi.getExtraInfoFields,
    targetModel: models.KuksaExtraInfoField,
    transform: (field) => ({
      id: field.id,
      name: field.name.fi,
    }),
  })
  await transferModel({
    getFromSource: eventApi.getExtraSelectionGroups,
    targetModel: models.KuksaExtraSelectionGroup,
    transform: (group) => ({
      id: group.id,
      name: group.name.fi,
    }),
  })
  await transferModel({
    getFromSource: eventApi.getExtraSelections,
    targetModel: models.KuksaExtraSelection,
    transform: (selection) => ({
      id: selection.id,
      kuksaExtraselectiongroupId: selection.extraSelectionGroup,
      name: selection.name.fi,
    }),
  })
  await transferModel({
    getFromSource: eventApi.getPayments,
    targetModel: models.KuksaPayment,
    transform: (field) => ({
      id: field.id,
      name: field.name.fi,
    }),
  })
}

async function transferParticipants(models: Models, eventApi: EventApi) {
  const participantDateRanges = config.fetchDateRanges
  // set the last date to be current date
  const lastIndex = participantDateRanges.length - 1
  participantDateRanges[lastIndex].endDate = moment().toISOString()

  console.log(
    'Transferring participants, their extra infos, selections and payments',
  )
  for (const daterange of participantDateRanges) {
    console.log(`\t daterange ${daterange.startDate} - ${daterange.endDate}`)
    await transferModel({
      getFromSource: eventApi.getParticipants,
      targetModel: models.KuksaParticipant,
      transform: (participant) => ({
        id: participant.id,
        firstName: participant.firstName || 'x',
        lastName: participant.lastName || 'x',
        nickname: participant.nickname,
        memberNumber: participant.memberNumber,
        dateOfBirth: participant.birthDate
          ? new Date(participant.birthDate)
          : null,
        phoneNumber: participant.phoneNumber,
        email: participant.email,
        representedParty: participant.representedParty,
        kuksaLocalgroupId: participant.group,
        kuksaVillageId: participant.village,
        kuksaCampgroupId: participant.campGroup,
        kuksaSubcampId: participant.subCamp,
        cancelled: participant.cancelled,
        diet: participant.diet,
        accommodation: participant.accommodation,
      }),
      dateRange: daterange,
    })
    await transferModel({
      getFromSource: eventApi.getParticipantExtraInfos,
      targetModel: models.KuksaParticipantExtraInfo,
      transform: (answer) => ({
        kuksaParticipantId: answer.for,
        kuksaExtrainfofieldId: answer.extraInfoField,
        value: answer.value && answer.value.substring(0, 254),
      }),
      dateRange: daterange,
    })
    await transferModel({
      getFromSource: eventApi.getParticipantExtraSelections,
      targetModel: models.KuksaParticipantExtraSelection,
      transform: (selection) => ({
        kuksaParticipantId: selection.from,
        kuksaExtraselectionId: selection.to,
      }),
      joinTable: true,
      dateRange: daterange,
    })
    await transferModel({
      getFromSource: eventApi.getParticipantPayments,
      targetModel: models.KuksaParticipantPayment,
      transform: (field) => ({
        kuksaParticipantId: field.from,
        kuksaPaymentId: field.to,
      }),
      joinTable: true,
      dateRange: daterange,
    })
  }
}

async function transferPayments(models: Models, eventApi: EventApi) {
  console.log('Transferring payment statuses...')

  await transferModel({
    getFromSource: eventApi.getParticipantPaymentStatus,
    targetModel: models.KuksaParticipantPaymentStatus,
    transform: (status) => ({
      kuksaParticipantId: status.for,
      billed: status.billed,
      paid: status.paid,
    }),
  })
}
