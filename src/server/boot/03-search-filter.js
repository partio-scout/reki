export default function(app){
  app.get('/api/searchfilters', app.requirePermission('view searchfilters'), async (req, res) => {
    const filters = await app.models.SearchFilter.find();
    res.json(filters);
  });

  app.delete('/api/searchfilters/:id', app.requirePermission('modify searchfilters'), app.wrap(async (req, res) => {
    const filter = await app.models.SearchFilter.findById(req.params.id);
    if (filter === null) {
      return res.status(404).send('Not found');
    }
    await filter.destroy();
    res.json({ count: 1 });
  }));

  app.post('/api/searchfilters', app.requirePermission('modify searchfilters'), app.wrap(async (req, res) => {
    const filter = await app.models.SearchFilter.create({
      filter: req.body.filter,
      name: req.body.name,
    });
    res.json(filter);
  }));

}
