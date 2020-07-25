import optionalBasicAuth from '../middleware/optional-basic-auth'
import { models } from '../models'
import { audit } from '../util/audit'

export default function (app) {
  app.get(
    '/api/audit-events',
    optionalBasicAuth(),
    app.requirePermission('view audit log'),
    app.wrap(async (req, res) => {
      await audit({ req, modelType: 'AuditEvent', eventType: 'find' })
      const events = await models.AuditEvent.findAll({ include: [{ model: models.AuditClientData, as: 'clientData', }] })
      res.json(events.map(models.AuditEvent.toClientJSON))
    }),
  )
}
