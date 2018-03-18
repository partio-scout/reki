import app from '../server/server';
import { models } from '../server/models';
import Promise from 'bluebird';
import moment from 'moment';
import transfer from './transfer';
import { getEventApi } from 'kuksa-event-api-client';
import participantDateRanges from '../../conf/participant-fetch-dates.json';

if (require.main === module) {
  main().then(
    () => { console.log('Finished successfully.'); process.exit(0); },
    err => { console.error(`Error: ${err}. Exiting.`); process.exit(1); }
  );
}

function main() {
  return getOptionsFromEnvironment()
    .then(getEventApi)
    .then(eventApi => transferTablesOnlyOnce(eventApi)
      .then(() => transferParticipants(eventApi))
      .then(() => transferPayments(eventApi)));
}

function getOptionsFromEnvironment() {
  function extractEnvVar(environmentVariable, description) {
    const value = process.env[environmentVariable];
    if (!value) {
      throw new Error(`Specify ${description} in the environment variable ${environmentVariable}.`);
    }
    return value;
  }

  return Promise.try(() => ({
    endpoint: extractEnvVar('KUKSA_API_ENDPOINT', 'the endpoint url of the kuksa api'),
    username: extractEnvVar('KUKSA_API_USERNAME', 'the username for the kuksa api'),
    password: extractEnvVar('KUKSA_API_PASSWORD', 'the password for the kuksa api'),
    eventId: extractEnvVar('KUKSA_API_EVENTID', 'the event id'),
  }));
}

function transferTablesOnlyOnce(eventApi) {
  console.log('Transferring sub camps, villages, local groups, extra selections, info fields and payments...');

  return transfer([
    {
      getFromSource: eventApi.getSubCamps,
      targetModel: models.KuksaSubCamp,
    },
    {
      getFromSource: eventApi.getVillages,
      targetModel: models.KuksaVillage,
      transform: village => ({
        id: village.id,
        subCampId: village.subCamp,
        name: village.name,
      }),
    },
    {
      getFromSource: eventApi.getCampGroups,
      targetModel: models.KuksaCampGroup,
      transform: campGroup => ({
        id: campGroup.id,
        subCampId: campGroup.subCamp,
        villageId: campGroup.village,
        name: campGroup.name,
      }),
    },
    {
      getFromSource: eventApi.getLocalGroups,
      targetModel: models.KuksaLocalGroup,
      transform: localGroup => ({
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
    },
    {
      getFromSource: eventApi.getExtraInfoFields,
      targetModel: models.KuksaExtraInfoField,
      transform: field => ({
        id: field.id,
        name: field.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getExtraSelectionGroups,
      targetModel: models.KuksaExtraSelectionGroup,
      transform: group => ({
        id: group.id,
        name: group.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getExtraSelections,
      targetModel: models.KuksaExtraSelection,
      transform: selection => ({
        id: selection.id,
        kuksaExtraselectiongroupId: selection.extraSelectionGroup,
        name: selection.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getPayments,
      targetModel: models.KuksaPayment,
      transform: field => ({
        id: field.id,
        name: field.name.fi,
      }),
    },
  ]);
}

function transferParticipants(eventApi) {
  function transferDaterange(daterange) {
    console.log(`\t daterange ${daterange.startDate} - ${daterange.endDate}`);
    return transfer([
      {
        getFromSource: eventApi.getParticipants,
        targetModel: models.KuksaParticipant,
        transform: participant => ({
          id: participant.id,
          firstName: participant.firstName || 'x',
          lastName: participant.lastName || 'x',
          nickname: participant.nickname,
          memberNumber: participant.memberNumber,
          dateOfBirth: new Date(participant.birthDate),
          phoneNumber: participant.phoneNumber,
          email: participant.email,
          representedParty: participant.representedParty,
          localGroupId: participant.group,
          villageId: participant.village,
          campGroupId: participant.campGroup,
          subCampId: participant.subCamp,
          cancelled: participant.cancelled,
          diet: participant.diet,
          accommodation: participant.accommodation,
        }),
        dateRange: daterange,
      },
      {
        getFromSource: eventApi.getParticipantExtraInfos,
        targetModel: models.KuksaParticipantExtraInfo,
        transform: answer => ({
          kuksaParticipantId: answer.for,
          fieldId: answer.extraInfoField,
          value: answer.value && answer.value.substring(0, 254),
        }),
        dateRange: daterange,
      },
      {
        getFromSource: eventApi.getParticipantExtraSelections,
        targetModel: models.KuksaParticipantExtraSelection,
        transform: selection => ({
          kuksaParticipantId: selection.from,
          kuksaExtraselectionId: selection.to,
        }),
        joinTable: true,
        dateRange: daterange,
      },
      {
        getFromSource: eventApi.getParticipantPayments,
        targetModel: models.KuksaParticipantPayment,
        transform: field => ({
          kuksaParticipantId: field.from,
          kuksaPaymentId: field.to,
        }),
        joinTable: true,
        dateRange: daterange,
      },
    ]);
  }

  // set the last date to be current date
  const lastIndex = participantDateRanges.length - 1;
  participantDateRanges[lastIndex].endDate = moment().toDate();

  console.log('Transferring participants, their extra infos, selections and payments');
  return Promise.each(participantDateRanges, daterange => transferDaterange(daterange));
}

function transferPayments(eventApi) {
  console.log('Transferring payment statuses...');

  return transfer([
    {
      getFromSource: eventApi.getParticipantPaymentStatus,
      targetModel: models.KuksaParticipantPaymentStatus,
      transform: status => ({
        participantId: status.for,
        billed: status.billed,
        paid: status.paid,
      }),
    },
  ]);
}
