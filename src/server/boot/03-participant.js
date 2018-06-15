import { models } from '../models';
import _ from 'lodash';

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
    const filter = JSON.parse(req.query.filter || '{}');
    const limit = +filter.limit || undefined;
    const offset = +filter.skip || undefined;
    // TODO refactor so this comes in right format already
    const order = filter.order ? filter.order.split(' ') : ['participantId', 'ASC'];

    let where = filter.where || {};

    // TODO refactor this out: it's silly to have and-array coming from frontend :)
    // More than one condition is represented as array for leagacy reasons -> move back to object
    if (where.and) {
      where = _.reduce(where.and, (cond, acc) => Object.assign(acc, cond), {});
    }

    // TODO Filter/validate where filter + order so it doesn't contain e.g. nested objects

    const result = await models.Participant.findAndCount( {
      where: where,
      include: [{ all: true, nested: true }],
      offset: offset,
      limit: limit,
      order: [ order ],
      distinct: true, // without this count is calculated incorrectly
    });
    res.json( { result: result.rows, count: result.count });
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
