import { models } from '../models'

export function getClientData(req) {
  const userAgent = req.headers['user-agent'] || ''
  const userId = req.user ? req.user.id : null
  const ipAddress = req.ip

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
