import { models } from '../models';

export default function(app){
  app.get('/api/participants/:id', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const participant = await models.Participant.findById(req.params.id , {
      include: [{ all: true, nested: true }],
    });

    if (participant) {
      await app.models.AuditEvent.createEvent.Participant(req.user.id, participant.id, 'find');
      res.json(participant);
    } else {
      res.status(404).send('Not found');
    }
  }));

  app.get('/api/participants', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const participants = await models.Participant.findAll( {
      include: [{ all: true, nested: true }],
    });
  }));
}
