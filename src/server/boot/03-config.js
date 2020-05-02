import config from '../conf'
import optionalBasicAuth from '../middleware/optional-basic-auth'

export default function (app) {
  app.get(
    '/api/config',
    optionalBasicAuth(),
    app.requirePermission('view app configuration'),
    app.wrap(async (req, res) => {
      res.json({
        fields: config.getParticipantFields(),
        tableFields: config.getParticipantTableFields(),
        detailsPageFields: config.getDetailsPageFields(),
        filters: config.getFilters(),
      })
    }),
  )
}
