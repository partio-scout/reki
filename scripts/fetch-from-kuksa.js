import app from '../src/server/server';
import { getEventApi } from 'kuksa-event-api-client';
import { Promise } from 'bluebird';
import { _ } from 'lodash';

const SubCamp = app.models.SubCamp;
const destroyAllSubCamps = Promise.promisify(SubCamp.destroyAll, { context: SubCamp });
const createSubCamps = Promise.promisify(SubCamp.create, { context: SubCamp });
const findSubCamps = Promise.promisify(SubCamp.find, { context: SubCamp });

const Village = app.models.Village;
const destroyAllVillages = Promise.promisify(Village.destroyAll, { context: Village });
const createVillages = Promise.promisify(Village.create, { context: Village });
const findVillages = Promise.promisify(Village.find, { context: Village });

const CampGroup = app.models.CampGroup;
const destroyAllCampGroups = Promise.promisify(CampGroup.destroyAll, { context: CampGroup });
const createCampGroups = Promise.promisify(CampGroup.create, { context: CampGroup });
const findCampGroups = Promise.promisify(CampGroup.find, { context: CampGroup });

const LocalGroup = app.models.LocalGroup;
const destroyAllLocalGroups = Promise.promisify(LocalGroup.destroyAll, { context: LocalGroup });
const createLocalGroups = Promise.promisify(LocalGroup.create, { context: LocalGroup });
const findLocalGroups = Promise.promisify(LocalGroup.find, { context: LocalGroup });

const KuksaParticipant = app.models.KuksaParticipant;
const upsertKuksaParticipants = Promise.promisify(KuksaParticipant.upsert, { context: KuksaParticipant });
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
    .then(passthrough(transferSubCamps))
    .then(passthrough(transferVillages))
    .then(passthrough(transferCampGroups))
    .then(passthrough(transferLocalGroups))
    .then(passthrough(transferKuksaParticipants))
    .then(() => console.log('Transfer compete'))
    .then(() => findSubCamps().then(res => console.log(res)))
    .then(() => findVillages().then(res => console.log(res)))
    .then(() => findCampGroups().then(res => console.log(res)))
    .then(() => findLocalGroups().then(res => console.log(res)))
    .then(() => findKuksaParticipants().then(res => console.log(res)))
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

function passthrough(func) {
  function execute(arg) {
    return func(arg).then(() => arg);
  }

  return execute;
}

function transferSubCamps(eventApi) {
  return eventApi.getSubCamps()
    .then(subCamps => destroyAllSubCamps().then(() => createSubCamps(subCamps)));
}

function transferVillages(eventApi) {
  return eventApi.getVillages()
    .then(villages => villages.map(village => ({
      id: village.id,
      subCampId: village.subCamp,
      name: village.name,
    })))
    .then(villages => destroyAllVillages().then(() => createVillages(villages)));
}

function transferCampGroups(eventApi) {
  return eventApi.getCampGroups()
    .then(campGroups => campGroups.map(campGroup => ({
      id: campGroup.id,
      subCampId: campGroup.subCamp,
      villageId: campGroup.village,
      name: campGroup.name,
    })))
    .then(campGroups => destroyAllCampGroups().then(() => createCampGroups(campGroups)));
}

function transferLocalGroups(eventApi) {
  return eventApi.getLocalGroups()
    .then(localGroups => localGroups.map(localGroup => ({
      id: localGroup.id,
      subCampId: localGroup.subCamp,
      villageId: localGroup.village,
      campGroupId: localGroup.campGroup,
      name: localGroup.name,
      scoutOrganization: localGroup.scoutOrganization,
      locality: localGroup.locality,
      country: localGroup.country,
      countryCode: localGroup.countryCode,
    })))
    .then(localGroups => destroyAllLocalGroups().then(() => createLocalGroups(localGroups)));
}

function transferKuksaParticipants(eventApi) {
  return eventApi.getParticipants()
    .then(participants => participants.map(participant => ({
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
    })))
    .then(participants =>
      _.reduce(participants, (acc, participant) =>
        acc.then(() => upsertKuksaParticipants(participant)), Promise.resolve())
    );
}

function syncToLiveData() {
  console.log('Syncing to live data...');
  return updateParticipantsTable()
    .then(deleteCancelledParticipants)
    .then(res => console.log('Sync complete'))
    .catch(err => console.error('Problem syncing to live data:', err, err.stack));
}

function updateParticipantsTable() {
  console.log('Updating participants table...');
  return findKuksaParticipants({
    include: [ { 'localGroup': 'subCamp' }, 'campGroup', 'subCamp' ],
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
    localGroup: participant.localGroup && participant.localGroup.name ? participant.localGroup.name : 'Muu',
    campGroup: participant.campGroup && participant.campGroup.name ? participant.campGroup.name : 'Muu',
    subCamp: participant.subCamp && participant.subCamp.name ? participant.subCamp.name : 'Muu',
    ageGroup: 'Muu',
    nonScout: false,
  })))
  .then(participants =>
    _.reduce(
      participants,
      (acc, participant) => acc.then(() => upsertParticipant(participant)),
      Promise.resolve()
    )
  ).then(res => console.log(res));
}

function deleteCancelledParticipants() {
  console.log('Deleting cancelled participants...');
  return findKuksaParticipants({ where: { cancelled: true } })
    .then(participants => _.map(participants, 'id'))
    .then(idsToDelete => destroyAllParticipants({ participantId: { inq: idsToDelete } }))
    .then(info => console.log(`Deleted ${info.count} cancelled participants.`));
}
