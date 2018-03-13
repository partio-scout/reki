export default function(app){
  app.get('/api/registryusers', app.requirePermission('view registry users'), async (req, res) => {
    const users = await app.models.RegistryUser.find();
    res.json(users);
  });

  app.get('/api/registryusers/:id', app.requirePermission('view own user information'), async (req, res) => {
    try {
      if (req.user.id === +req.params.id){
        const users = await app.models.RegistryUser.findById(req.params.id, { include: 'rekiRoles' });
        res.json(users);
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
      }
    });
  });

  app.post('/api/registryusers/:id/unblock', app.requirePermission('block and unblock users'), async (req, res) => {
    app.models.RegistryUser.unblock(req.params.id, (err, result) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(204).send('');
      }
    });
  });

}
