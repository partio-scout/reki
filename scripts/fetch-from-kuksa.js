import app from '../src/server/server';
import { getEventApi } from 'kuksa-event-api-client';
import { Promise } from 'bluebird';

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
    .then(() => console.log('Transfer compete'))
    .then(() => findSubCamps().then(res => console.log(res)))
    .then(() => findVillages().then(res => console.log(res)))
    .then(() => findCampGroups().then(res => console.log(res)));
}

function getOptionsFromEnvironment() {
  function extractEnvVar(environmentVariable, description) {
    const value = process.env[environmentVariable];
    if (!value) {
      throw new Error(`Specify ${description} in the environment variable ${environmentVariable}.`);
    }
    return value;
  }

  return Promise.try(() => {
    return {
      endpoint: extractEnvVar('KUKSA_API_ENDPOINT', 'the endpoint url of the kuksa api'),
      username: extractEnvVar('KUKSA_API_USERNAME', 'the username for the kuksa api'),
      password: extractEnvVar('KUKSA_API_PASSWORD', 'the password for the kuksa api'),
      eventId: extractEnvVar('KUKSA_API_EVENTID', 'the event id for Roihu'),
    };
  });
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
