import { models } from '../models';

export default function(app) {
  app.get('/api/options/', app.requirePermission('view participants'), async (req, res) => {
    const options = await models.Option.findAll();
    res.json(options);
  });
}
