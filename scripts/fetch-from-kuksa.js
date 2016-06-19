import app from '../src/server/server';
import transfer from '../src/kuksa-integration/transfer';
import { getEventApi } from 'kuksa-event-api-client';
import { Promise } from 'bluebird';
import { _ } from 'lodash';

const KuksaParticipant = app.models.KuksaParticipant;
const findKuksaParticipants = Promise.promisify(KuksaParticipant.find, { context: KuksaParticipant });

const Participant = app.models.Participant;
const upsertParticipant = Promise.promisify(Participant.upsert, { context: Participant });
const destroyAllParticipants = Promise.promisify(Participant.destroyAll, { context: Participant });

if (require.main === module) {
  main().then(
    () => { console.log('Finished successfully.'); process.exit(0); },
    err => { console.error(`Error: ${err}. Exiting.`); process.exit(1); }
  );
}

function main() {
  return getOptionsFromEnvironment()
    .then(getEventApi)
    .then(transferDataFromKuksa)
    .then(syncToLiveData);
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

function transferDataFromKuksa(eventApi) {
  console.log('Transferring data from Kuksa...');
  return transfer([
    {
      getFromSource: eventApi.getSubCamps,
      targetModel: app.models.SubCamp,
    },
    {
      getFromSource: eventApi.getVillages,
      targetModel: app.models.Village,
      transform: village => ({
        id: village.id,
        subCampId: village.subCamp,
        name: village.name,
      }),
    },
    {
      getFromSource: eventApi.getCampGroups,
      targetModel: app.models.CampGroup,
      transform: campGroup => ({
        id: campGroup.id,
        subCampId: campGroup.subCamp,
        villageId: campGroup.village,
        name: campGroup.name,
      }),
    },
    {
      getFromSource: eventApi.getLocalGroups,
      targetModel: app.models.LocalGroup,
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
      getFromSource: eventApi.getParticipants,
      targetModel: app.models.KuksaParticipant,
      transform: participant => ({
        id: participant.id,
        firstName: participant.firstName || 'x',
        lastName: participant.lastName || 'x',
        memberNumber: 'XXXXX',
        dateOfBirth: new Date(participant.birthDate),
        phoneNumber: participant.phoneNumber,
        email: participant.email,
        localGroup: participant.group,
        campGroup: participant.campGroup,
        subCampId: participant.subCamp,
        cancelled: participant.cancelled,
      }),
    },
    {
      getFromSource: eventApi.getExtraInfoFields,
      targetModel: app.models.ExtraInfoField,
      transform: field => ({
        id: field.id,
        name: field.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getParticipantExtraInfos,
      targetModel: app.models.ParticipantExtraInfo,
      transform: answer => ({
        participantId: answer.for,
        fieldId: answer.extraInfoField,
        value: answer.value,
      }),
    },
    {
      getFromSource: eventApi.getExtraSelectionGroups,
      targetModel: app.models.ExtraSelectionGroup,
      transform: group => ({
        id: group.id,
        name: group.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getExtraSelections,
      targetModel: app.models.ExtraSelection,
      transform: selection => ({
        id: selection.id,
        groupId: selection.extraSelectionGroup,
        name: selection.name.fi,
      }),
    },
    {
      getFromSource: eventApi.getParticipantExtraSelections,
      targetModel: app.models.ParticipantExtraSelection,
      transform: selection => ({
        participantId: selection.from,
        selectionId: selection.to,
      }),
    },
  ]).then(() => console.log('Transfer complete.'));
}

function syncToLiveData() {
  console.log('Syncing to live data...');
  return updateParticipantsTable()
    .then(deleteCancelledParticipants)
    .then(res => console.log('Sync complete'))
    .catch(err => console.error('Problem syncing to live data:', err, err.stack));
}

function getInfoForField(participant, fieldName) {
  const field = _.find(participant.extraInfos, o => _.get(o, 'field.name') === fieldName);
  return field ? field.value : null;
}

function getSelectionForGroup(participant, fieldName) {
  const selection = _.find(participant.extraSelections, o => _.get(o, 'group.name') === fieldName);
  return selection ? selection.name : null;
}

function updateParticipantsTable() {
  console.log('Updating participants table...');
  return findKuksaParticipants({
    include: [
      { 'localGroup': 'subCamp' },
      'campGroup',
      'subCamp',
      { 'extraInfos': 'field' },
      { 'extraSelections': 'group' },
    ],
  })
  .then(participants => participants.map(participant => participant.toObject()))
  .then(participants => participants.map(participant => ({
    participantId: participant.id,
    firstName: participant.firstName,
    lastName: participant.lastName,
    memberNumber: participant.memberNumber,
    dateOfBirth: participant.dateOfBirth,
    phoneNumber: participant.phoneNumber,
    email: participant.email,
    localGroup: _.get(participant, 'localGroup.name') || 'Muu',
    campGroup: _.get(participant, 'campGroup.name') || 'Muu',
    subCamp: _.get(participant, 'subCamp.name') || 'Muu',
    ageGroup: getSelectionForGroup(participant, 'Osallistun seuraavan ikäkauden ohjelmaan:') || 'Muu',
    nonScout: false,
    staffPosition: getInfoForField(participant, 'Pesti'),
  })))
  .then(participants =>
    _.reduce(
      participants,
      (acc, participant) => acc.then(() => upsertParticipant(participant)),
      Promise.resolve()
    )
  );
}

function deleteCancelledParticipants() {
  console.log('Deleting cancelled participants...');
  return findKuksaParticipants({ where: { cancelled: true } })
    .then(participants => _.map(participants, 'id'))
    .then(idsToDelete => destroyAllParticipants({ participantId: { inq: idsToDelete } }))
    .then(info => console.log(`Deleted ${info.count} cancelled participants.`));
}
