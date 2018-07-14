import _ from 'lodash';
import Promise from 'bluebird';

export default function(app, permissions) {
  const UNAUTHORIZED = 401;

  function _err(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
  }

  function roleHasPermission(role, permission) {
    return permissions[role].indexOf(permission) > -1;
  }

  async function isRequestAllowed(permission, req) {
    const tokenId = ''+(req.query.access_token || req.get('Authorization'));
    if (!tokenId) {
      throw _err(UNAUTHORIZED, 'Unauthorized: No access token given');
    }

    const token = await app.models.AccessToken.findById(tokenId);
    if (!token) {
      throw _err(UNAUTHORIZED, 'Unauthorized: Invalid access token');
    }

    // Check token validity (expiry date)
    // token.validate() only supports callbacks out-of-the-box -> promisify
    const isValid = await Promise.promisify(token.validate, { context: token })();
    if (!isValid) {
      throw _err(UNAUTHORIZED, 'Unauthorized: Invalid access token');
    }

    const user = await app.models.RegistryUser.findById(token.userId, { include: 'rekiRoles' });

    // Token belongs to a user -> add user to request
    if (user) {
      req.user = user;
    }

    const roleNames = user.toObject().rekiRoles.map(role => role.name);
    const hasPerm = _.some(roleNames, name => roleHasPermission(name, permission));
    return hasPerm;
  }

  return function requirePermission(permission) {
    return function(req, res, next) {
      // We need to handle the return value as a callback because Express middlewares
      // don't support promises. For this we need to cast it to a Bluebird promise
      // using Promise.resolve():
      Promise.resolve(isRequestAllowed(permission, req)).asCallback((err, allowed) => {
        if (!err && allowed === true) {
          next();
        } else if (allowed === false) {
          res.status(UNAUTHORIZED).send('Unauthorized: You do not have permission to perform this action');
        } else if (err.status) {
          res.status(err.status).send(err.message);
        } else {
          console.error(err);
          res.status(500).send('Internal server error');
        }
      });
    };
  };
}
