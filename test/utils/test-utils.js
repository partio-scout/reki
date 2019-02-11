export async function resetDatabase(pool) {
  await pool.query(`TRUNCATE TABLE
    participant,
    allergy,
    participant_allergy,
    participant_date,
    participant_note,
    participant_presence,
    selection,
    option,
    search_filter,
    migration_status,
    kuksa_campgroup,
    kuksa_localgroup,
    kuksa_subcamp,
    kuksa_village,
    kuksa_participant,
    kuksa_extrainfofield,
    kuksa_participantextrainfo,
    kuksa_extraselectiongroup,
    kuksa_extraselection,
    kuksa_participantextraselection,
    kuksa_payment,
    kuksa_participantpayment,
    kuksa_participantpaymentstatus`);
}

export function createParticipantFixtures(pool, fixtures) {
  return pool.query(`INSERT INTO participant
    SELECT
      "participantId" as participant_id,
      "memberNumber" as member_number,
      "firstName" as first_name,
      "lastName" as last_name,
      "localGroup" as local_group,
      "subCamp" as sub_camp,
      village,
      "campGroup" as camp_group,
      COALESCE("campOfficeNotes", '') as camp_office_notes,
      COALESCE("editableInfo", '') as extra_info,
      COALESCE("kuksaData", '{}'::json) as kuksa_data
    FROM json_to_recordset($1)
    AS x (
      "participantId" integer,
      "memberNumber" text,
      "firstName" text,
      "lastName" text,
      "localGroup" text,
      "subCamp" text,
      village text,
      "campGroup" text,
      "campOfficeNotes" text,
      "editableInfo" text,
      "kuksaData" json
    )`, [JSON.stringify(fixtures)]);
}

export function createParticipantDateFixtures(pool, fixtures) {
  return pool.query(`INSERT INTO participant_date
    SELECT
      participant,
      date
    FROM json_to_recordset($1)
    AS x (
      participant integer,
      date date
    )`, [JSON.stringify(fixtures)]);
}

export function createPresenceHistoryFixtures(pool, fixtures) {
  return pool.query(`INSERT INTO participant_presence
    SELECT
      participant,
      presence,
      '' as note
    FROM json_to_recordset($1)
    AS x (
      participant integer,
      presence integer
    )`, [JSON.stringify(fixtures)]);
}

export function createAllergyFixtures(pool, fixtures) {
  return pool.query(`INSERT INTO allergy
    SELECT
      "allergyId" as allergy_id,
      name
    FROM json_to_recordset($1)
    AS x (
      "allergyId" integer,
      name text
    )`, [JSON.stringify(fixtures)]);
}

export function createSelectionFixtures(pool, fixtures) {
  return pool.query(`INSERT INTO selection
    SELECT
      "selectionId" as selection_id,
      "kuksaGroupId" as kuksa_group_id,
      "kuksaSelectionId" as kuksa_selection_id,
      "groupName" as group_name,
      "selectionName" as selection_name,
      "participantId" as participant_id
    FROM json_to_recordset($1)
    AS x (
      "selectionId" integer,
      "kuksaGroupId" integer,
      "kuksaSelectionId" integer,
      "groupName" text,
      "selectionName" text,
      "participantId" integer
    )`, [JSON.stringify(fixtures)]);
}

export function createParticipantAllergyFixtures(pool, fixtures) {
  return pool.query(`INSERT INTO participant_allergy
    SELECT
      "participantId" as participant_id,
      "allergyId" as allergy_id
    FROM json_to_recordset($1)
    AS x (
      "participantId" integer,
      "allergyId" integer
    )`, [JSON.stringify(fixtures)]);
}

export function deleteSearchFilters(pool) {
  return pool.query('TRUNCATE TABLE search_filter');
}
