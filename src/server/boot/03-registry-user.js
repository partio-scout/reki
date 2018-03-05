export default function(app){
  app.get('/api/registryusers', app.requirePermission('view registy users'), async (req, res) => {
    const users = await app.models.RegistyUsers.find();
    res.json(users);
  });
}
