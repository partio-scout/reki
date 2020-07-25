import { models } from '../models'
import { Address4, Address6 } from 'ip-address'

async function findOrCreateClientData(req) {
  const userAgent = req.headers['user-agent'] || ''
  const ipAddress = req.ip.includes(':') ? new Address6(req.ip) : new Address4(req.ip)
  const ipVersion = req.ip.includes(':') ? 'ipv6': 'ivp4'

  const [data] = await models.AuditClientData.findOrCreate({
    where: {
      userAgent,
      ipAddress: ipAddress.bigInteger(),
      ipVersion,
    },
  })

  return data
}

export function getDiff(object) {
  // TODO: only include changes
  return [object.get(), object.previous()]
}

export async function audit({
  req, // express request object
  modelId = 0,
  modelType,
  eventType,
  reason = '',
  diff = {},
}) {
  const clientData = await findOrCreateClientData(req)
  const changes = JSON.stringify(diff)

  await models.AuditEvent.create({
    eventType,
    model: modelType,
    modelId,
    reason,
    changes,
    userId: req.user.id,
    clientDataId: clientData.id,
  })
}
