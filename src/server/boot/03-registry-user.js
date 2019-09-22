import optionalBasicAuth from '../middleware/optional-basic-auth';
import { models } from '../models';

export default function(app){
  app.get('/api/registryusers', optionalBasicAuth(), app.requirePermission('view registry users'), async (req, res) => {
    await models.AuditEvent.createEvent.User(req.user.id, 0, 'find');
    const users = await models.User.findAll();
    res.json(users.map(models.User.toClientFormat));
  });

  app.post('/api/registryusers/:id/block', optionalBasicAuth(), app.requirePermission('block and unblock users'), app.wrap(async (req, res) => {
    await models.User.update({ blocked: true }, { where: { id: req.params.id } });
    res.status(204).send('');
    models.AuditEvent.createEvent.User(req.user.id, req.params.id, 'block');
  }));

  app.post('/api/registryusers/:id/unblock', optionalBasicAuth(), app.requirePermission('block and unblock users'), app.wrap(async (req, res) => {
    await models.User.update({ blocked: false }, { where: { id: req.params.id } });
    res.status(204).send('');
    models.AuditEvent.createEvent.User(req.user.id, req.params.id, 'unblock');
  }));

  app.post('/api/registryusers/logout', optionalBasicAuth(), (req, res) => {
    req.logout();
    res.status(204).send('');
  });

}
