export default function(app){
  app.get('/api/searchfilters', app.requirePermission('view search filters'), async (req, res) => {
    const filters = await app.models.SearchFilter.find();
    res.json(filters);
  });

  app.del('/api/searchfilters/:id', app.requirePermission('view search filters'), async (req, res) => {
    try {
      const filter = await app.models.SearchFilter.findById(req.params.id);

      if (filter === null) {
        return res.status(404).send('Not found');
      }

      await filter.destroy();
      res.json({ count: 1 });
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal server error');
    }
  });

  app.post('/api/searchfilters', app.requirePermission('view search filters'), async (req, res) => {
    try {
      const filter = await app.models.SearchFilter.create({
        filter: req.body.filter,
        name: req.body.name,
      });
      res.json(filter);
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal server error');
    }
  });

}
