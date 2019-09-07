import _ from 'lodash';

export default function(app, permissions) {
  const UNAUTHORIZED = 401;

  function roleHasPermission(role, permission) {
    return permissions[role].indexOf(permission) > -1;
  }

  function hasPermission(user, permission) {
    const roleNames = user.roles;
    return _.some(roleNames, name => roleHasPermission(name, permission));
  }

  return function requirePermission(permission) {
    return function(req, res, next) {
      try {
        if (!req.user || !hasPermission(req.user, permission)) {
          res.status(UNAUTHORIZED).json({ message: 'Unauthorized: You do not have permission to perform this action' });
          return;
        } else {
          next();
          return;
        }
      } catch (e) {
        next(e);
      }
    };
  };
}
