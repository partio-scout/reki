import moment from 'moment';
import { getEventApi } from 'kuksa-event-api-client';
import config from '../server/conf';
import { usingSpinner } from './util';
import { createConnection, usingTransaction } from '../server/database';

const main = () => usingSpinner(async () => {
  const options = getOptionsFromEnvironment();
  const eventApi = getEventApi(options);

  const pool = await createConnection();
  try {
    await usingTransaction(pool, async tx => {
      await transferTablesOnlyOnce(eventApi, tx);
      await transferParticipants(eventApi, tx);
      await transferPayments(eventApi, tx);
    });
  } finally {
    pool.end();
  }
});

function getOptionsFromEnvironment() {
  function extractEnvVar(environmentVariable, description) {
    const value = process.env[environmentVariable];
    if (!value) {
      throw new Error(`Specify ${description} in the environment variable ${environmentVariable}.`);
    }
    return value;
  }

  return {
    endpoint: extractEnvVar('KUKSA_API_ENDPOINT', 'the endpoint url of the kuksa api'),
    username: extractEnvVar('KUKSA_API_USERNAME', 'the username for the kuksa api'),
    password: extractEnvVar('KUKSA_API_PASSWORD', 'the password for the kuksa api'),
    eventId: extractEnvVar('KUKSA_API_EVENTID', 'the event id'),
    proxy: process.env.KUKSA_API_PROXY_URL, // optional
  };
}

async function transferTablesOnlyOnce(eventApi, connection) {
  console.log('Transferring sub camps');
  const subCamps = await eventApi.getSubCamps();
  await connection.query(`INSERT INTO kuksa_subcamp (id, name)
  SELECT id, name
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name text
  )`,
    [JSON.stringify(subCamps)]);

  console.log('Transferring villages');
  const villages = await eventApi.getVillages();
  await connection.query(`INSERT INTO kuksa_village (
    id,
    name
  )
  SELECT
    id,
    name
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name text
  )`,
    [JSON.stringify(villages)]);

  console.log('Transferring camp groups');
  const campGroups = await eventApi.getCampGroups();
  await connection.query(`INSERT INTO kuksa_campgroup (
    id,
    name
  )
  SELECT
    id,
    name
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name text
  )`,
    [JSON.stringify(campGroups)]);

  console.log('Transferring local groups');
  const localGroups = await eventApi.getLocalGroups();
  await connection.query(`INSERT INTO kuksa_localgroup (
    id,
    name,
    scout_organization,
    locality,
    country,
    country_code
  )
  SELECT
    id,
    name,
    "scoutOrganization" as scout_organization,
    locality,
    country,
    "countryCode" as country_code
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name text,
    "scoutOrganization" text,
    locality text,
    country text,
    "countryCode" text
  )`,
    [JSON.stringify(localGroups)]);

  console.log('Transferring extra info fields');
  const extraInfoFields = await eventApi.getExtraInfoFields();
  await connection.query(`INSERT INTO kuksa_extrainfofield (
    id,
    name
  )
  SELECT
    id,
    name->>'fi' as name
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name json
  )`,
    [JSON.stringify(extraInfoFields)]);

  console.log('Transferring extra selection groups');
  const extraSelectionGroups = await eventApi.getExtraSelectionGroups();
  await connection.query(`INSERT INTO kuksa_extraselectiongroup (
    id,
    name
  )
  SELECT
    id,
    name->>'fi' as name
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name json
  )`,
    [JSON.stringify(extraSelectionGroups)]);

  console.log('Transferring extra selections');
  const extraSelections = await eventApi.getExtraSelections();
  await connection.query(`INSERT INTO kuksa_extraselection (
    id,
    name,
    extra_selection_group
  )
  SELECT
    id,
    name->>'fi' as name,
    "extraSelectionGroup" as extra_selection_group
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name json,
    "extraSelectionGroup" integer
  )`,
    [JSON.stringify(extraSelections)]);

  console.log('Transferring payments');
  const payments = await eventApi.getPayments();
  await connection.query(`INSERT INTO kuksa_payment (
    id,
    name
  )
  SELECT
    id,
    name->>'fi' as name
  FROM json_to_recordset($1)
  AS x (
    id integer,
    name json
  )`,
    [JSON.stringify(payments)]);
}

async function transferParticipants(eventApi, connection) {
  async function transferDaterange(daterange) {
    console.log(`\t daterange ${daterange.startDate} - ${daterange.endDate}`);

    const participants = await eventApi.getParticipants(daterange);
    await connection.query(`INSERT INTO kuksa_participant (
      id,
      first_name,
      last_name,
      member_number,
      nickname,
      date_of_birth,
      phone_number,
      email,
      represented_party,
      accommodation,
      cancelled,
      diet,
      local_group,
      camp_group,
      village,
      subcamp
    )
    SELECT
      id,
      "firstName" as first_name,
      "lastName" as last_name,
      "memberNumber" as member_number,
      nickname,
      "birthDate" as date_of_birth,
      "phoneNumber" as phone_number,
      email,
      "representedParty" as represented_party,
      accommodation,
      cancelled,
      diet,
      "group" as local_group,
      "campGroup" as camp_group,
      village,
      "subCamp" as subcamp
    FROM json_to_recordset($1)
    AS x (
      id integer,
      "firstName" text,
      "lastName" text,
      nickname text,
      "memberNumber" text,
      "birthDate" date,
      "phoneNumber" text,
      email text,
      "representedParty" text,
      "group" integer,
      village integer,
      "campGroup" integer,
      "subCamp" integer,
      cancelled boolean,
      diet text,
      accommodation text
    )`,
      [JSON.stringify(participants)]);

    const participantExtraInfos = await eventApi.getParticipantExtraInfos(daterange);
    await connection.query(`INSERT INTO kuksa_participantextrainfo (
      participant,
      field,
      value
    )
    SELECT
      "for" as participant,
      "extraInfoField" as field,
      value
    FROM json_to_recordset($1)
    AS x (
      "for" integer,
      "extraInfoField" integer,
      value text
    )`,
      [JSON.stringify(participantExtraInfos)]);

    const participantExtraSelections = await eventApi.getParticipantExtraSelections(daterange);
    await connection.query(`INSERT INTO kuksa_participantextraselection (
      participant,
      extra_selection
    )
    SELECT
      "from" as participant,
      "to" as extra_selection
    FROM json_to_recordset($1)
    AS x (
      "from" integer,
      "to" integer
    )`,
      [JSON.stringify(participantExtraSelections)]);

    const participantPayments = await eventApi.getParticipantPayments(daterange);
    await connection.query(`INSERT INTO kuksa_participantpayment (
      participant,
      payment
    )
    SELECT
      "from" as participant,
      "to" as payment
    FROM json_to_recordset($1)
    AS x (
      "from" integer,
      "to" integer
    )`,
      [JSON.stringify(participantPayments)]);
  }

  const participantDateRanges = config.getFetchDateRanges();
  // set the last date to be current date
  const lastIndex = participantDateRanges.length - 1;
  participantDateRanges[lastIndex].endDate = moment().toISOString();

  console.log('Transferring participants, their extra infos, selections and payments');
  for (const daterange of participantDateRanges) {
    await transferDaterange(daterange);
  }
}

async function transferPayments(eventApi, connection) {
  console.log('Transferring payment statuses...');

  const participantPaymentStatuses = await eventApi.getParticipantPaymentStatus();
  await connection.query(`INSERT INTO kuksa_participantpaymentstatus (
    participant,
    billed,
    paid
  )
  SELECT
    "for" as participant,
    billed,
    paid
  FROM json_to_recordset($1)
  AS x (
    "for" integer,
    billed date,
    paid date
  )`,
    [JSON.stringify(participantPaymentStatuses)]);
}

if (require.main === module) {
  main().then(
    () => { console.log('Finished successfully.'); process.exit(0); },
    err => { console.error(`Error: ${err}. Exiting.`); process.exit(1); }
  );
}
