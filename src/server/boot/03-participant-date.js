import _ from 'lodash';
export default function(app) {
  app.get('/api/participantdates/', app.requirePermission('view participants'), async (req, res) => {
    const participantDates = await app.models.ParticipantDate.find({ 
    	fields: { date : true, participantId : false },
      order: 'date ASC'
    });
    const uniqueDates = _.uniqBy(participantDates, val => val.date.getTime());
    res.json(uniqueDates);
  });
}
