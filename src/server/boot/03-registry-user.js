export default function(app){
  app.get('/api/registryusers', app.requirePermission('view registy users'), async (req, res) => {
    const users = await app.models.RegistyUsers.find();
    res.json(users);
  });

  app.get('/api/registryusers/:id', app.requirePermission('view own registryUser by id'), async (req, res) => {
    const users = await app.models.RegistyUsers.findById(req.params.id, { include: 'accesToken' });
    res.json(users);
  });

}
