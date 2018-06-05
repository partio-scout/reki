import { models } from '../models';

export default function(app){

  app.get('/api/participants/:id', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const id = +req.params.id || 0;
    const participant = await models.Participant.findById(id , {
      include: [{ all: true, nested: true }],
    });

    if (participant) {
      await app.models.AuditEvent.createEvent.Participant(req.user.id, participant.participantId, 'find');
      res.json(participant);
    } else {
      res.status(404).send('Not found');
    }
  }));

  app.get('/api/participants', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const participants = await models.Participant.findAll( {
      include: [{ all: true, nested: true }],
    });
    res.json( { result: participants, count: 0 });
  }));

  app.post('/api/participants/massAssign', app.requirePermission('edit participants'), app.wrap(async (req, res) => {
    const updates = await models.Participant.massAssignField(
      req.body.ids,
      req.body.fieldName,
      req.body.newValue,
      req.user.id
    );
    res.json(updates);
  }));
}
