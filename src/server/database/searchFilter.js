export async function getAllSearchFilters(pool) {
  const { rows } = await pool.query('SELECT * FROM search_filter');

  const filters = rows.map(filter => ({
    id: filter.id,
    name: filter.name,
    filter: formatFilterString(filter),
  }));

  return filters;
}

export async function deleteSearchFilterById(pool, id) {
  const result = await pool.query('DELETE FROM search_filter WHERE search_filter_id = $1', [id]);

  return result.rowCount === 1;
}

export async function addNewSearchFilter(pool, searchFilter) {
  await pool.query('INSERT INTO search_filter (name, free_text, dates, fields) VALUES ($1, $2, $3, $4)', [searchFilter.name, searchFilter.freeText, searchFilter.dates, searchFilter.fields]);
}

function formatFilterString(filter) {
  const freeText = filter.free_text !== '' ? { textSearch: filter.free_text } : {};
  const dates = filter.dates.length > 0 ? { dates: filter.dates } : {};
  const filterObject = Object.assign({}, freeText, dates, filter.fields);
  return `?filter=${JSON.stringify(filterObject)}`;
}
