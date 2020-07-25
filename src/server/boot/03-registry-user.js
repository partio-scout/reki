import optionalBasicAuth from '../middleware/optional-basic-auth'
import { models } from '../models'
import { audit } from '../util/audit'

const modelType = 'User'

export default function (app) {
  app.get(
    '/api/registryusers',
    optionalBasicAuth(),
    app.requirePermission('view registry users'),
    async (req, res) => {
      await audit({ req, modelType, eventType: 'find' })
      const users = await models.User.findAll()
      res.json(users.map(models.User.toClientFormat))
    },
  )

  app.post(
    '/api/registryusers/:id/block',
    optionalBasicAuth(),
    app.requirePermission('block and unblock users'),
    app.wrap(async (req, res) => {
      const user = await models.User.update(
        { blocked: true },
        { where: { id: req.params.id } },
      )
      res.status(204).send('')
      await audit({ req, modelId: user.id, modelType, eventType: 'block' })
    }),
  )

  app.post(
    '/api/registryusers/:id/unblock',
    optionalBasicAuth(),
    app.requirePermission('block and unblock users'),
    app.wrap(async (req, res) => {
      const user = await models.User.update(
        { blocked: false },
        { where: { id: req.params.id } },
      )
      res.status(204).send('')
      await audit({ req, modelId: user.id, modelType, eventType: 'unblock' })
    }),
  )

  app.post('/api/registryusers/logout', optionalBasicAuth(), (req, res) => {
    req.logout()
    res.status(204).send('')
  })
}
