export async function countAllergies(pool) {
  const result = await pool.query(`SELECT COUNT(*)
  FROM allergy`);
  return result.rows[0].count;
}

export async function getAllergyById(pool, id) {
  const result = await pool.query(`SELECT
    allergy_id as id,
    name
  FROM allergy
  WHERE id=$1`, [id]);
  return result.rows;
}
