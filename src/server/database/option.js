export async function countOptions(pool, where = {}) {
  const result = await pool.query(`SELECT COUNT(*)
  FROM option
  WHERE ${where.property ? `property = '${where.property}'` : 'true'}
    AND ${where.value ? `value = '${where.value}'` : 'true'}`);
  return result.rows[0].count;
}
