import optionalBasicAuth from '../middleware/optional-basic-auth'
import { models } from '../models'
import { audit } from '../util/audit'

export default function (app) {
  app.get(
    '/api/audit-events',
    optionalBasicAuth(),
    app.requirePermission('view audit log'),
    app.wrap(async (req, res) => {
      const filter = JSON.parse(req.query.filter || '{}')

      const where = filter.where || {}
      const limit = +filter.limit || 250
      const offset = +filter.skip || undefined
      const order = filter.order
        ? filter.order.split(' ')
        : ['timestamp', 'DESC']

      const events = await models.AuditEvent.findAll({
        include: [
          { model: models.AuditClientData, as: 'clientData' },
          { model: models.User },
        ],
        where,
        limit,
        offset,
        order: [order],
      })

      await audit({
        req,
        modelType: 'AuditEvent',
        eventType: 'find',
        meta: { filter, generatedQuery: { where, offset, limit, order } },
      })

      res.json(events.map(models.AuditEvent.toClientJSON))
    }),
  )
}
