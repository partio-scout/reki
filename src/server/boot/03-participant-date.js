import _ from 'lodash'
import { models } from '../models'
import optionalBasicAuth from '../middleware/optional-basic-auth'

export default function (app) {
  app.get(
    '/api/participantdates',
    optionalBasicAuth(),
    app.requirePermission('view participants'),
    app.wrap(async (req, res) => {
      const participantDates = await models.ParticipantDate.findAll({
        fields: { date: true, participantId: false },
        order: [['date', 'ASC']],
      })
      const uniqueDates = _.uniqBy(participantDates, (val) =>
        val.date.getTime(),
      )
      res.json(uniqueDates)
    }),
  )
}
