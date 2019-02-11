import config from '../conf';
import {
  getParticipantById,
  searchAndCountParticipants,
  setParticipantsPresence,
  setParticipantsExtraInfo,
  setParticipantsCampOfficeNotes,
} from '../database/participant';

export default function(app){

  app.get('/api/participants/:id', app.wrap(async (req, res) => {
    const id = Number(req.params.id) || 0;

    const participant = await getParticipantById(app.locals.pool, id);

    if (participant) {
      res.json(participant);
    } else {
      res.status(404).send('Not found');
    }
  }));

  function isValidOrderParameter(orderParam) {
    return Array.isArray(orderParam)
      && orderParam.length === 2
      && isAllowedSortingField(orderParam[0])
      && ['ASC', 'DESC'].includes(orderParam[1]);
  }

  function isAllowedSortingField(fieldName) {
    return [
      'participantId',
      'memberNumber',
      'firstName',
      'lastName',
      'localGroup',
      'subCamp',
      'village',
      'campGroup',
      'extraInfo',
      ...config.getParticipantCustomFields(),
    ].includes(fieldName);
  }

  app.get('/api/participants', app.wrap(async (req, res) => {
    const filter = JSON.parse(req.query.filter || '{}');
    const limit = Number(filter.limit) || null;
    const offset = Number(filter.skip) || null;
    const order = isValidOrderParameter(filter.order) ? filter.order : ['participantId', 'DESC'];

    const result = await searchAndCountParticipants(app.locals.pool, filter.where, order, offset, limit);

    res.json(result);
  }));

  app.post('/api/participants/massAssign', app.wrap(async (req, res) => {
    const {
      ids,
      fieldName,
      newValue,
    } = req.body;

    if (!Array.isArray(ids)) {
      const error = new Error('Ids needs to be an array.');
      error.status = 400;
      throw error;
    }

    if (fieldName === 'presence') {
      if (!([0,1,2,3].contains(newValue))) {
        const error = new Error(`${newValue} is not a valid presence value.`);
        error.status = 400;
        throw error;
      }

      await setParticipantsPresence(app.locals.pool, newValue, ids);
      res.sendStatus(200);
    } else if (fieldName === 'editableInfo') {
      await setParticipantsExtraInfo(app.locals.pool, newValue, ids);
      res.sendStatus(200);
    } else if (fieldName === 'campOfficeNotes') {
      await setParticipantsCampOfficeNotes(app.locals.pool, newValue, ids);
    } else {
      const error = new Error(`Editing field ${fieldName} is not allowed.`);
      error.status = 400;
      throw error;
    }
  }));
}
