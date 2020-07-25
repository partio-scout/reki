import { models } from '../models'
import { Address4, Address6 } from 'ip-address'

export function getIpVersionAndAddress(ip) {
  // if it does not contain ':', it's probably an ipv4 address
  if (!ip.includes(':')) {
    return ['ipv4', new Address4(ip)]
  }

  // if it includes a ':' and a '.', is's probably a "IPv4-mapped IPv6 addresses"
  // see https://en.wikipedia.org/wiki/IPv6#IPv4-mapped_IPv6_addresses for details
  if (ip.includes('.')) {
    const ipv4 = ip.split(':').pop()
    return ['ipv4', new Address4(ipv4)]
  }

  // otherwise it's probably a proper v6 address
  return ['ipv6', new Address6(ip)]
}

async function findOrCreateClientData(req) {
  const userAgent = req.headers['user-agent'] || ''
  const [ipVersion, ipAddress] = getIpVersionAndAddress(req.ip)

  const [data] = await models.AuditClientData.findOrCreate({
    where: {
      userAgent,
      ipAddress: ipAddress.bigInteger(),
      ipVersion,
    },
  })

  return data
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
