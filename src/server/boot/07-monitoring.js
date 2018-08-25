export default function(app) {
  app.get('/monitoring', app.wrap(async (req, res) => {
    try {
      await app.locals.pool.query('SELECT 1');
      res.status(200).send('OK');
    } catch (err) {
      res.status(500).send('ERROR');
    }
  }));
}
