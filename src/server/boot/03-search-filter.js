import { getAllSearchFilters, deleteSearchFilterById, addNewSearchFilter } from '../database/searchFilter';

export default function(app){
  app.get('/api/searchfilters', app.wrap(async (req, res) => {
    const filters = await getAllSearchFilters(app.locals.pool);

    res.json(filters);
  }));

  app.delete('/api/searchfilters/:id', app.wrap(async (req, res) => {
    const id = Number(req.params.id) || 0;

    const success = deleteSearchFilterById(app.locals.pool, id);

    if (!success) {
      return res.status(404).send('Not found');
    }
    res.json({ count: 1 });
  }));

  app.post('/api/searchfilters', app.wrap(async (req, res) => {
    const searchFilter = {
      name: req.body.name,
      freeText: req.body.freeText,
      dates: req.body.dates,
      fields: req.body.fields,
    };

    await addNewSearchFilter(app.locals.pool, searchFilter);
  }));

}
