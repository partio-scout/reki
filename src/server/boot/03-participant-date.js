import _ from 'lodash';
import { models } from '../models';

export default function(app) {
  app.get('/api/participantdates', app.requirePermission('view participants'), async (req, res) => {
    const participantDates = await app.models.ParticipantDate.findAll({
      fields: { date : true, participantId : false },
      order: 'date ASC',
    });
    const uniqueDates = _.uniqBy(participantDates, val => val.date.getTime());
    res.json(uniqueDates);
  });
}
