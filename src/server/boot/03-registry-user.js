export default function(app){
  app.get('/api/registryusers', app.requirePermission('view registry users'), async (req, res) => {
    await app.models.AuditEvent.createEvent.Registryuser(req.user.id, 0, 'find');
    const users = await app.models.RegistryUser.find();
    res.json(users);
  });

  app.get('/api/registryusers/:id', app.requirePermission('view own user information'), async (req, res) => {
    try {
      if (req.user.id === +req.params.id){
        const user = await app.models.RegistryUser.findById(req.params.id, { include: 'rekiRoles' });
        res.json(user);
        app.models.AuditEvent.createEvent.Registryuser(req.user.id, user.id, 'find');
      } else {
        return res.status(401).send('Unauthorized');
      }
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal server error');
    }
  });

  app.post('/api/registryusers/:id/block', app.requirePermission('block and unblock users'), async (req, res) => {
    app.models.RegistryUser.block(req.params.id, (err, result) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(204).send('');
        app.models.AuditEvent.createEvent.Registryuser(req.user.id, req.params.id, 'block');
      }
    });
  });

  app.post('/api/registryusers/:id/unblock', app.requirePermission('block and unblock users'), async (req, res) => {
    app.models.RegistryUser.unblock(req.params.id, (err, result) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(204).send('');
        app.models.AuditEvent.createEvent.Registryuser(req.user.id, req.params.id, 'add');
      }
    });
  });

  app.post('/api/registryusers/logout', async (req, res) => {
    try {
      await app.models.RegistryUser.logout(req.query.access_token || req.get('Authorization'));
      res.status(204).send('');
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal server error');
    }
  });

}
