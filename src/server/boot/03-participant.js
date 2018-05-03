export default function(app){
  app.get('/api/participants', app.requirePermission('view participants'), app.wrap(async (req, res) => {

    let filter = JSON.parse(req.query.filter || '{}');
    filter = app.models.Participant.handleTextSearch(filter);
    filter = await app.models.Participant.handleDateSearch(filter);

    if (filter.count) {
      res.json({
        result: await app.models.Participant.find(filter || {}),
        count: await app.models.Participant.count(filter.where || {}),
      });
    } else {
      res.json(await app.models.Participant.find(filter || {}));
    }

  }));

  app.get('/api/participants/:id', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const participant = await app.models.Participant.findById(req.params.id, {
      include: [
        { 'presenceHistory': 'author' },
        'allergies',
        'dates',
        'selections',
      ],
    });

    if (participant) {
      await app.models.AuditEvent.createEvent.Participant(req.user.id, participant.id, 'find');
      res.json(participant);
    } else {
      res.status(404).send('Not found');
    }
  }));

  app.post('/api/participants/massAssign', app.requirePermission('edit participants'), app.wrap(async (req, res) => {
    const updates = await app.models.Participant.massAssignField(
      req.body.ids,
      req.body.fieldName,
      req.body.newValue,
      req.user.id
    );
    res.json(updates);
  }));
}
