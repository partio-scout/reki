import { _ } from 'lodash';
import config from '../server/conf';
import { usingSpinner } from './util';
import { createConnection, usingTransaction } from '../server/database';

const main = () => usingSpinner(async () => {
  const pool = await createConnection();
  try {
    await usingTransaction(pool, async tx => {
      await buildAllergyTable(tx);
      await rebuildParticipantsTable(tx);
      await addAllergiesToParticipants(tx);
      await addDatesToParticipants(tx);
      await buildSelectionTable(tx);
      await deleteCancelledParticipants(tx);
      await buildOptionTable(tx);
    });
  } finally {
    pool.end();
  }
});

async function buildAllergyTable(connection) {
  console.log('Rebuilding allergies table...');

  await connection.query(`INSERT INTO allergy (
    allergy_id,
    name
  )
  SELECT
    selection.id as allergy_id,
    selection.name as name
  FROM kuksa_extraselection as selection, kuksa_extraselectiongroup as selection_group
  WHERE selection.extra_selection_group = selection_group.id
    AND selection_group.name = ANY($1::text[])
  ON CONFLICT ON CONSTRAINT allergy_pkey
    DO UPDATE SET
      name = excluded.name`,
    [config.getAllergyFieldTitles()]);
}

async function getWrappedParticipants(connection) {
  async function getExtraInfo(participantId, fieldName) {
    const res = await connection.query(`SELECT p.value as value
    FROM kuksa_participantextrainfo as p,
         kuksa_extrainfofield as f
    WHERE p.field = f.id
      AND p.participant = $1
      AND f.name = $2`,
      [participantId, fieldName]);
    if (res.rows.length === 1) {
      return res.rows[0].value;
    } else {
      return null;
    }
  }

  async function getAllExtraSelections(participantId, fieldName) {
    const res = await connection.query(`SELECT s.name as name
    FROM kuksa_extraselection as s,
         kuksa_extraselectiongroup as g,
         kuksa_participantextraselection as p
    WHERE s.id = p.extra_selection
      AND s.extra_selection_group = g.id
      AND p.participant = $1
      AND g.name = $2`,
      [participantId, fieldName]);

    return res.rows.map(selection => selection.name);
  }

  async function getExtraSelection(participantId, fieldName) {
    const extraSelections = await getAllExtraSelections(participantId, fieldName);
    return extraSelections.length > 0 ? extraSelections[0] : null;
  }

  async function getPaymentStatus(participantId, type) {
    const query = type === 'billed' ? 'SELECT billed FROM kuksa_participantpaymentstatus WHERE participant = $1'
      : type === 'paid' ? 'SELECT paid FROM kuksa_participantpaymentstatus WHERE participant = $1'
      : undefined;

    if (!query) {
      return null;
    }

    const res = await connection.query({ text: query, values: [participantId], rowMode: 'array' });
    return res.rows.length === 1 ? res.rows[0][0] : null;
  }

  async function getPayments(participantId) {
    const res = await connection.query(`SELECT kuksa_payment.name as name
    FROM kuksa_payment, kuksa_participantpayment
    WHERE kuksa_payment.id = kuksa_participantpayment.payment
      AND kuksa_participantpayment.participant = $1`,
      [participantId]);

    return res.rows.map(x => x.name);
  }

  const participants = await connection.query(`SELECT
    p.id,
    p.first_name as "firstName",
    p.last_name as "lastName",
    p.member_number as "memberNumber",
    p.nickname,
    p.date_of_birth as "dateOfBirth",
    p.phone_number as "phoneNumber",
    p.email,
    p.represented_party as "representedParty",
    p.accommodation,
    p.cancelled,
    p.diet,
    row_to_json(lg.*) as "localGroup",
    row_to_json(cg.*) as "campGroup",
    row_to_json(v.*) as village,
    row_to_json(s.*) as "subCamp"
  FROM kuksa_participant as p
  LEFT JOIN kuksa_localgroup as lg ON lg.id = p.local_group
  LEFT JOIN kuksa_campgroup as cg ON cg.id = p.camp_group
  LEFT JOIN kuksa_village as v ON v.id = p.village
  LEFT JOIN kuksa_subcamp as s ON s.id = p.subcamp
  WHERE cancelled = false`);

  return participants.rows.map(participant =>
    Object.assign(
      {},
      participant,
      {
        getPaymentStatus: async type => await getPaymentStatus(participant.id, type),
        getExtraInfo: async field => await getExtraInfo(participant.id, field),
        getExtraSelection: async groupName => await getExtraSelection(participant.id, groupName),
        getAllExtraSelections: async groupName => await getAllExtraSelections(participant.id, groupName),
        getPayments: async () => await getPayments(participant.id),
      }));
}

async function rebuildParticipantsTable(connection) {
  console.log('Rebuilding participants table...');

  const participantBuilder = config.getParticipantBuilderFunction();

  for (const wrappedParticipant of await getWrappedParticipants(connection)) {
    const participant = await participantBuilder(wrappedParticipant);
    const {
      id,
      memberNumber,
      firstName,
      lastName,
    } = wrappedParticipant;
    const {
      localGroup,
      campGroup,
      village,
      subCamp,
    } = participant;
    const kuksaData = _.omit(participant, [
      'localGroup',
      'campGroup',
      'village',
      'subCamp',
    ]);
    await connection.query(`INSERT INTO participant (
      participant_id,
      member_number,
      first_name,
      last_name,
      local_group,
      camp_group,
      village,
      sub_camp,
      kuksa_data
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9
    )
    ON CONFLICT ON CONSTRAINT participant_pkey
      DO UPDATE SET
        member_number = excluded.member_number,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        local_group = excluded.local_group,
        camp_group = excluded.camp_group,
        village = excluded.village,
        sub_camp = excluded.sub_camp,
        kuksa_data = excluded.kuksa_data`,
      [
        id,
        memberNumber,
        firstName,
        lastName,
        localGroup,
        campGroup,
        village,
        subCamp,
        kuksaData,
      ]);
  }
}

async function addAllergiesToParticipants(connection) {
  console.log('Adding allergies and diets to participants...');

  await connection.query('TRUNCATE TABLE participant_allergy');
  await connection.query(`INSERT INTO participant_allergy (
    allergy_id,
    participant_id
  )
  SELECT
    allergy.allergy_id as allergy_id,
    participant.participant_id as participant_id
  FROM
    allergy,
    kuksa_participantextraselection as participant_selection,
    participant
  WHERE allergy.allergy_id = participant_selection.extra_selection
    AND participant_selection.participant = participant.participant_id`);

  console.log('Allergies and diets added.');
}

async function addDatesToParticipants(connection) {
  const participantDatesMapper = config.getParticipantDatesMapper();

  console.log('Adding dates to participants...');

  const participantDates = await getParticipantDates();

  await connection.query('TRUNCATE TABLE participant_date');
  await connection.query(`INSERT INTO participant_date (
    participant,
    date
  )
  SELECT
    "participantId" as participant,
    date
  FROM json_to_recordset($1)
  AS x (
    "participantId" integer,
    date date
  )`,
    [JSON.stringify(participantDates)]);

  async function getParticipantDates() {
    const participantDates = [];

    for (const wrappedParticipant of await getWrappedParticipants(connection)) {
      participantDates.push(_(await participantDatesMapper(wrappedParticipant))
        .uniq()
        .sort()
        .map(date => ({
          participantId: wrappedParticipant.id,
          date: date,
        }))
        .value());
    }

    const res =  _.flatten(participantDates);
    console.log(res);
    return res;
  }
}

async function buildSelectionTable(connection) {
  console.log('Building selections table...');

  await connection.query('TRUNCATE TABLE selection');
  await connection.query(`INSERT INTO selection (
    participant_id,
    kuksa_selection_id,
    kuksa_group_id,
    selection_name,
    group_name
  )
  SELECT
    ps.participant as participant_id,
    s.id as kuksa_selection_id,
    sg.id as kuksa_group_id,
    s.name as selection_name,
    sg.name as group_name
  FROM
    participant as p,
    kuksa_participantextraselection as ps,
    kuksa_extraselection as s,
    kuksa_extraselectiongroup as sg
  WHERE p.participant_id = ps.participant
    AND s.id = ps.extra_selection
    AND sg.id = s.extra_selection_group
    AND sg.name = ANY($1::text[])`,
    [config.getSelectionGroupTitles()]);

  console.log('Selections table built.');
}

async function deleteCancelledParticipants(connection) {
  console.log('Deleting cancelled participants...');

  await connection.query(`DELETE FROM participant
  WHERE participant_id IN (
    SELECT
      id
    FROM kuksa_participant
    WHERE cancelled = true
  )`);
  console.log('Deleted cancelled participants.');
}

async function buildOptionTable(connection) {
  await connection.query('TRUNCATE TABLE option');

  const alwaysIncludedOptionFields = {
    localGroup: 'local_group',
    subCamp: 'sub_camp',
    village: 'village',
    campGroup: 'camp_group',
  };

  const optionFieldNames = config.getOptionFieldNames();

  for (const optionField of _.intersection(optionFieldNames, Object.keys(alwaysIncludedOptionFields))) {
    const optionName = alwaysIncludedOptionFields[optionField];
    await connection.query(`INSERT INTO option (
      property,
      value
    )
    SELECT DISTINCT
      '${optionField}' as property,
      ${optionName} as value
    FROM participant`);
  }

  for (const optionField of _.difference(optionFieldNames, Object.keys(alwaysIncludedOptionFields))) {
    await connection.query(`INSERT INTO option (
      property,
      value
    )
    SELECT DISTINCT
      '${optionField}' as property,
      kuksa_data->>'${optionField}' as value
    FROM participant
    WHERE kuksa_data ? '${optionField}'
      AND kuksa_data->>'${optionField}' IS NOT NULL`);
  }
}

if (require.main === module) {
  main().then(
    () => { console.log('Finished successfully.'); process.exit(0); },
    err => { console.error(`Error: ${err}. Exiting.`); process.exit(1); }
  );
}
