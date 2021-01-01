import { Request } from 'express'
import { models } from '../models'
import '../express-type-extensions' // This import is required to make the tests work. https://github.com/TypeStrong/ts-node#help-my-types-are-missing

export function getClientData(req: Request): ClientData {
  const userAgent = req.headers['user-agent'] || ''
  const userId = req.user?.id
  const ipAddress = req.ip

  return { userId, ipAddress, userAgent }
}

export interface ClientData {
  userId: string | undefined
  ipAddress: string
  userAgent: string
}

export interface AuditParams extends ClientData {
  modelId?: number
  modelType: string
  eventType: string
  reason?: string
  changes?: Record<string, unknown>
  meta?: Record<string, unknown>
}

export async function audit({
  modelId,
  modelType,
  eventType,
  reason = '',
  changes = {},
  meta = {},
  userId,
  ipAddress,
  userAgent,
}: AuditParams) {
  await models.AuditEvent.create({
    eventType,
    model: modelType,
    modelId: modelId ?? null,
    changes,
    meta,
    reason,
    userId: userId ?? null,
    ipAddress,
    userAgent,
  })
}
