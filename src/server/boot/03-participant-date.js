export default function(app) {
  app.get('/api/participantdates', app.wrap(async (req, res) => {
    const { rows } = await app.locals.pool.query('SELECT DISTINCT date FROM participant_date ORDER BY date ASC');
    res.json(rows);
  }));
}
