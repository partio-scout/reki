import app from '../src/server/server';
import transfer from '../src/kuksa-integration/transfer';
import { getEventApi } from 'kuksa-event-api-client';
import { Promise } from 'bluebird';
import { _ } from 'lodash';
import moment from 'moment';

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
    .then(rebuildParticipantsTable)
    .then(deleteCancelledParticipants);
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
  function getDateFromArg(index) {
    if (process.argv.length > index) {
      return new Date(process.argv[index]);
    }
  }

  console.log('Transferring data from Kuksa...');

  const dateRange = {
    startDate: getDateFromArg(2) || moment().subtract(36, 'hours').toDate(),
    endDate: getDateFromArg(3) || moment().toDate(),
  };

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
        localGroupId: participant.group,
        campGroupId: participant.campGroup,
        subCampId: participant.subCamp,
        cancelled: participant.cancelled,
      }),
      dateRange: dateRange,
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
      getFromSource: eventApi.getParticipantExtraInfos,
      targetModel: app.models.KuksaParticipantExtraInfo,
      transform: answer => ({
        participantId: answer.for,
        fieldId: answer.extraInfoField,
        value: answer.value,
      }),
      dateRange: dateRange,
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
  ])
  .then(() => {
    // In order to remove deleted extra selections we need to delete all extra selections
    // for the participant before inserting. Thus we need special treatment.
    const ExtraSelection = app.models.KuksaParticipantExtraSelection;
    const destroyAll = Promise.promisify(ExtraSelection.destroyAll, { context: ExtraSelection });
    const create = Promise.promisify(ExtraSelection.create, { context: ExtraSelection });
    function destroySelectionsForParticipants(ids) {
      return destroyAll({
        participantId: { inq: ids },
      });
    }
    return eventApi.getParticipantExtraSelections(dateRange)
      .then(selections => _.groupBy(selections, 'from'))
      .then(selectionsByParticipant =>
        destroySelectionsForParticipants(_.keys(selectionsByParticipant))
          .then(() => _.flatMap(selectionsByParticipant))
      )
      .then(selections => _.map(selections, selection => ({
        participantId: selection.from,
        selectionId: selection.to,
      })))
      .then(selections => create(selections));
  })
  .then(() => console.log('Transfer complete.'));
}

function rebuildParticipantsTable() {
  function getInfoForField(participant, fieldName) {
    const field = _.find(participant.extraInfos, o => _.get(o, 'field.name') === fieldName);
    return field ? field.value : null;
  }

  function getSelectionForGroup(participant, fieldName) {
    const selection = _.find(participant.extraSelections, o => _.get(o, 'group.name') === fieldName);
    return selection ? selection.name : null;
  }

  console.log('Rebuilding participants table...');

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
    // Not a scout if a) no finnish member number 2) not part of international group ("local group")
    nonScout: !participant.memberNumber && !_.get(participant, 'localGroup.name'),
    staffPosition: getInfoForField(participant, 'Pesti'),
    staffPositionInGenerator: getInfoForField(participant, 'Pesti kehittimessä'),
    willOfTheWisp: getSelectionForGroup(participant, 'Virvatuli'),
    willOfTheWispWave: getSelectionForGroup(participant, 'Virvatulen aalto'),
    guardianOne: getInfoForField(participant, 'Leirillä olevan lapsen huoltaja (nro 1)'),
    guardianTwo: getInfoForField(participant, 'Leirillä olevan lapsen huoltaja (nro 2)'),
  })))
  .then(participants =>
    _.reduce(
      participants,
      (acc, participant) => acc.then(() => upsertParticipant(participant)),
      Promise.resolve()
    )
  ).then(() => console.log('Rebuild complete.'));
}

function deleteCancelledParticipants() {
  console.log('Deleting cancelled participants...');
  return findKuksaParticipants({ where: { cancelled: true } })
    .then(participants => _.map(participants, 'id'))
    .then(idsToDelete => destroyAllParticipants({ participantId: { inq: idsToDelete } }))
    .then(info => console.log(`Deleted ${info.count} cancelled participants.`));
}
