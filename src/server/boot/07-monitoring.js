export default function(app) {
  app.get('/monitoring', (req, res) => {
    app.models.RegistryUser.count((err, count) => {
      if (err) {
        res.status(500).send('ERROR');
      } else {
        res.status(200).send('OK');
      }
    });
  });
}
