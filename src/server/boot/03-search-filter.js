export default function(app){
  app.get('/api/searchfilters', app.wrap(async (req, res) => {
    const { rows } = await app.locals.pool.query('SELECT * FROM search_filter');

    const filters = rows.map(filter => ({
      id: filter.id,
      name: filter.name,
      filter: formatFilterString(filter),
    }));

    res.json(filters);
  }));

  function formatFilterString(filter) {
    const freeText = filter.free_text !== '' ? { textSearch: filter.free_text } : {};
    const dates = filter.dates.length > 0 ? { dates: filter.dates } : {};
    const filterObject = Object.assign({}, freeText, dates, filter.fields);
    return `?filter=${JSON.stringify(filterObject)}`;
  }

  app.delete('/api/searchfilters/:id', app.wrap(async (req, res) => {
    const id = Number(req.params.id) || 0;

    const result = await app.locals.pool.query('DELETE FROM search_filters WHERE search_filter_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Not found');
    }
    res.json({ count: 1 });
  }));

  app.post('/api/searchfilters', app.wrap(async (req, res) => {
    await app.locals.pool.query('INSERT INTO search_filters (name, free_text, dates, fields) VALUES ($1, $2, $3, $4)', [req.body.name, req.body.freeText, req.body.dates, req.body.fields]);
  }));

}
