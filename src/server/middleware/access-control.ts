import express from 'express'
import _ from 'lodash'

export default function (
  app: express.Application,
  permissions: Record<string, readonly string[]>,
) {
  const UNAUTHORIZED = 401

  function roleHasPermission(role: string, permission: string) {
    return (permissions[role]?.indexOf(permission) ?? -1) > -1
  }

  function hasPermission(
    user: { roles: readonly string[] },
    permission: string,
  ) {
    const roleNames = user.roles
    return _.some(roleNames, (name) => roleHasPermission(name, permission))
  }

  return function requirePermission(
    permission: string,
  ): express.RequestHandler {
    return function (req, res, next) {
      try {
        if (!req.user || !hasPermission(req.user, permission)) {
          res.status(UNAUTHORIZED).json({
            message:
              'Unauthorized: You do not have permission to perform this action',
          })
          return
        } else {
          next()
          return
        }
      } catch (e) {
        next(e)
      }
    }
  }
}
