import app from '../server/server';
import Promise from 'bluebird';
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
      .then(() => transferParticipants(eventApi)
        .then(() => transferPayments(eventApi))));
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
    eventId: extractEnvVar('KUKSA_API_EVENTID', 'the event id for Roihu'),
  }));
}

function transferTablesOnlyOnce(eventApi) {
  console.log('Transferring sub camps, villages, local groups, extra selection and info fields...');

  return transfer([
    {
      getFromSource: eventApi.getSubCamps,
      targetModel: app.models.KuksaSubCamp,
    },
    {
      getFromSource: eventApi.getVillages,
      targetModel: app.models.KuksaVillage,
      transform: village => ({
        id: village.id,
        subCampId: village.subCamp,
        name: village.name,
      }),
    },
    {
      getFromSource: eventApi.getCampGroups,
      targetModel: app.models.KuksaCampGroup,
      transform: campGroup => ({
        id: campGroup.id,
        subCampId: campGroup.subCamp,
        villageId: campGroup.village,
        name: campGroup.name,
      }),
    },
    {
      getFromSource: eventApi.getLocalGroups,
      targetModel: app.models.KuksaLocalGroup,
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
      targetModel: app.models.KuksaExtraInfoField,
      transform: field => ({
        id: field.id,
        name: field.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getExtraSelectionGroups,
      targetModel: app.models.KuksaExtraSelectionGroup,
      transform: group => ({
        id: group.id,
        name: group.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getExtraSelections,
      targetModel: app.models.KuksaExtraSelection,
      transform: selection => ({
        id: selection.id,
        groupId: selection.extraSelectionGroup,
        name: selection.name.fi,
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
        targetModel: app.models.KuksaParticipant,
        transform: participant => ({
          id: participant.id,
          firstName: participant.firstName || 'x',
          lastName: participant.lastName || 'x',
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
        }),
        dateRange: daterange,
      },
      {
        getFromSource: eventApi.getParticipantExtraInfos,
        targetModel: app.models.KuksaParticipantExtraInfo,
        transform: answer => ({
          participantId: answer.for,
          fieldId: answer.extraInfoField,
          value: answer.value && answer.value.substring(0, 254),
        }),
        dateRange: daterange,
      },
      {
        getFromSource: eventApi.getParticipantExtraSelections,
        targetModel: app.models.KuksaParticipantExtraSelection,
        transform: selection => ({
          participantId: selection.from,
          selectionId: selection.to,
        }),
        joinTable: true,
        dateRange: daterange,
      },
    ]);
  }
  console.log('Transferring participants and their extra infos and selections');
  return Promise.each(participantDateRanges, daterange => transferDaterange(daterange));
}

function transferPayments(eventApi) {
  console.log('Transferring payments...');

  return transfer([
    {
      getFromSource: eventApi.getPayments,
      targetModel: app.models.KuksaPayment,
      transform: field => ({
        id: field.id,
        name: field.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getParticipantPayments,
      targetModel: app.models.KuksaParticipantPayment,
      transform: field => ({
        participantId: field.from,
        paymentId: field.to,
      }),
      joinTable: true,
    },

    {
      getFromSource: eventApi.getParticipantPaymentStatus,
      targetModel: app.models.KuksaParticipantPaymentStatus,
      transform: status => ({
        participantId: status.for,
        billed: status.billed,
        paid: status.paid,
      }),
    },
  ]);
}
