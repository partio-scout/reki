export default function(app) {
  app.get('/api/options', app.wrap(async (req, res) => {
    const { rows } = await app.locals.pool.query('SELECT property, value FROM option');
    res.json(rows);
  }));
}
