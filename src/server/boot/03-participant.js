export default function(app){
  app.get('/api/participants/:id', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const participant = await app.models.Participant.findById(req.params.id, {
      include:[
        { 'presenceHistory':'author' },
        'allergies',
        'dates',
        'selections',
      ],
    });

    if (participant){
      await app.models.AuditEvent.createEvent.Participant(req.user.id, participant.id, 'find');
      res.json(participant);
    } else {
      res.status(404).send('Not found');
    }
  }));
}
