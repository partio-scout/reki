import { models } from '../models';
import optionalBasicAuth from '../middleware/optional-basic-auth';

export default function(app){
  app.get('/api/searchfilters', optionalBasicAuth(), app.requirePermission('view searchfilters'), async (req, res) => {
    const filters = await models.SearchFilter.findAll();
    res.json(filters);
  });

  app.delete('/api/searchfilters/:id', optionalBasicAuth(), app.requirePermission('modify searchfilters'), app.wrap(async (req, res) => {
    const id = +req.params.id || 0;
    const filter = await models.SearchFilter.findById(id);
    if (filter === null) {
      return res.status(404).send('Not found');
    }
    await filter.destroy();
    res.json({ count: 1 });
  }));

  app.post('/api/searchfilters', optionalBasicAuth(), app.requirePermission('modify searchfilters'), app.wrap(async (req, res) => {
    const filter = await models.SearchFilter.create({
      filter: req.body.filter,
      name: req.body.name,
    });
    res.json(filter);
  }));

}
