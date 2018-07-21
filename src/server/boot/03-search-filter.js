import { models } from '../models';

export default function(app){
  app.get('/api/searchfilters', app.requirePermission('view searchfilters'), async (req, res) => {
    const filters = await models.SearchFilter.findAll();
    res.json(filters);
  });

  app.delete('/api/searchfilters/:id', app.requirePermission('modify searchfilters'), app.wrap(async (req, res) => {
    const id = +req.params.id || 0;
    const filter = await models.SearchFilter.findById(id);
    if (filter === null) {
      return res.status(404).send('Not found');
    }
    await filter.destroy();
    res.json({ count: 1 });
  }));

  app.post('/api/searchfilters', app.requirePermission('modify searchfilters'), app.wrap(async (req, res) => {
    const filter = await models.SearchFilter.create({
      filter: String(req.body.filter),
      name: String(req.body.name),
    });
    res.json(filter);
  }));

}
