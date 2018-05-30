import { models } from '../models';

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
    const id = +req.params.id || 0;
    const participant = await models.Participant.findById(id , {
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
