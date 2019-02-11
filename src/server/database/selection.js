export async function findSelectionsByGroupId(pool, groupId) {
  const result = await pool.query(`SELECT
    selection_id as "selectionId",
    kuksa_group_id as "kuksaGroupId",
    kuksa_selection_id as "kuksaSelectionId",
    group_name as "groupName",
    selection_name as "selectionName",
    participant_id as "participantId"
  FROM selection
  WHERE kuksa_group_id=$1`, [groupId]);

  return result.rows;
}

export async function findSelectionsBySelectionId(pool, selectionId) {
  const result = await pool.query(`SELECT
    selection_id as "selectionId",
    kuksa_group_id as "kuksaGroupId",
    kuksa_selection_id as "kuksaSelectionId",
    group_name as "groupName",
    selection_name as "selectionName",
    participant_id as "participantId"
  FROM selection
  WHERE kuksa_selection_id=$1`, [selectionId]);

  return result.rows;
}

