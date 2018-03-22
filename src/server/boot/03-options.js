export default function(app) {
  app.get('/api/options/', app.requirePermission('view participants'), async (req, res) => {
    const options = await app.models.Option.find();
    res.json(options);
  });
}
