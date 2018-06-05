export default function(app) {
  app.get('/monitoring', app.wrap(async (req, res) => {
    try {
      await app.models.RegistryUser.count();
      res.status(200).send('OK');
    } catch (err) {
      res.status(500).send('ERROR');
    }
  }));
}
