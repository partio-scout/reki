import { models } from '../models'

export function getClientData(req) {
  const userAgent = req.headers['user-agent'] || ''
  const userId = req.user ? req.user.id : null
  let ipAddress = req.ip

  // if it includes a ':' and a '.', is's probably a "IPv4-mapped IPv6 addresses"
  // see https://en.wikipedia.org/wiki/IPv6#IPv4-mapped_IPv6_addresses for details
  // those are confusing and unnecessary, let's not use those
  if (ipAddress.includes('.') && ipAddress.includes(':')) {
    ipAddress = ipAddress.split(':').pop()
  }

  return { userId, ipAddress, userAgent }
}

export async function audit({
  modelId = null,
  modelType,
  eventType,
  reason = '',
  changes = {},
  meta = {},

  userId,
  ipAddress,
  userAgent,
}) {
  await models.AuditEvent.create({
    eventType,
    model: modelType,
    modelId,
    changes,
    meta,
    reason,
    userId,
    ipAddress,
    userAgent,
  })
}
