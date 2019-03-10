import optionalBasicAuth from '../middleware/optional-basic-auth';

export default function(app){
  app.get('/api/registryusers', optionalBasicAuth(), app.requirePermission('view registry users'), async (req, res) => {
    await app.models.AuditEvent.createEvent.Registryuser(req.user.id, 0, 'find');
    const users = await app.models.RegistryUser.find();
    res.json(users);
  });

  app.get('/api/registryusers/currentUser', optionalBasicAuth(), (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Unauthorized: You do not have permission to perform this action' });
    }
  });

  app.get('/api/registryusers/:id', optionalBasicAuth(), app.requirePermission('view own user information'), app.wrap(async (req, res) => {
    if (req.user.id === +req.params.id) {
      const user = await app.models.RegistryUser.findById(req.params.id, { include: 'rekiRoles' });
      res.json(user);
      app.models.AuditEvent.createEvent.Registryuser(req.user.id, user.id, 'find');
    } else {
      return res.status(401).send('Unauthorized');
    }
  }));

  app.post('/api/registryusers/:id/block', optionalBasicAuth(), app.requirePermission('block and unblock users'), app.wrap(async (req, res) => {
    await app.models.RegistryUser.block(req.params.id);
    res.status(204).send('');
    app.models.AuditEvent.createEvent.Registryuser(req.user.id, req.params.id, 'block');
  }));

  app.post('/api/registryusers/:id/unblock', optionalBasicAuth(), app.requirePermission('block and unblock users'), app.wrap(async (req, res) => {
    await app.models.RegistryUser.unblock(req.params.id);
    res.status(204).send('');
    app.models.AuditEvent.createEvent.Registryuser(req.user.id, req.params.id, 'unblock');
  }));

  app.post('/api/registryusers/logout', optionalBasicAuth(), (req, res) => {
    req.logout();
    res.status(204).send('');
  });

}
