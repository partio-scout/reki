export default function(app) {
  app.get('/monitoring', (req, res) => {
    app.models.RegistryUser.count((err, count) => {
      if (err || count === 0) {
        res.status(500).send('ERROR');
      } else {
        res.status(200).send('OK');
      }
    });
  });
}
