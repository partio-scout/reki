import { models } from '../models';
import optionalBasicAuth from '../middleware/optional-basic-auth';

export default function(app) {
  app.get('/api/options', optionalBasicAuth(), app.requirePermission('view participants'), async (req, res) => {
    const options = await models.Option.findAll();
    res.json(options);
  });
}
