/*
TODO:
- reset package.json -> all tests run
- fix linter stuff
- refactor
- move test endpoints to inside test
  - also inject custom conf in test -> really only tests this functionality
- refactor
- add logging:
- move to separate file, add boot script that:
  - reads config
  - sets app.requirePermission
*/

import _ from 'lodash';
import Promise from 'bluebird';

export default function(app) {

  const conf = {
    "registryUser": [
      "view role test"
    ],
    "registryAdmin": [
      "perform other action"
    ]
  };

  function requirePermissionZ(conf) {
    function getTokenFromReq(req) {
      let tokenId;
      if (req.query.access_token) {
        tokenId = req.query.access_token;
      } else {
        tokenId = req.get('Authorization');
      }
      if (!tokenId) {
        return Promise.reject('No access token given');
      }
      return app.models.AccessToken.findById(tokenId);
    }

    function validateToken(token) {
      if (!token) {
        return Promise.reject('Access token not found');
      }

      return new Promise(function(resolve, reject) {
        token.validate(function(err, isValid) {
          if (err || !isValid) {
            return reject(err || 'Invalid access token');
          }
          resolve(token);
        });
      });
    }

    function roleHasPermission(role, permission) {
      return conf[role].indexOf(permission) > -1;
    }

    let _debug = x => { console.warn('DEBUG: ', x); return x }

    return function requirePermissionX(perm) {
      return function(req, res, next) {
        getTokenFromReq(req)
          .then(validateToken)
          .then(token => token.userId)
          .then(userId => app.models.RegistryUser.findById(userId, { include: 'rekiRoles' }))
          .then(user => user.toObject().rekiRoles)
          .then(roles => roles.map(role => role.name))
          // At least some of the user's roles has this perm -> allow
          .then(roleNames => _.some(roleNames, name => roleHasPermission(name, perm)))
          .then(hasPerm => {
            if (hasPerm) {
              next();
            } else {
              return Promise.reject('User does not have sufficient permissions');
            }
          })
          .catch(err => {
            //FIXME: log this somewhere smarted
            console.log('Unauthorized: ' + err);
            res.status(401).send('Unauthorized');
          });
      }
    }
  }

  const requirePermission = requirePermissionZ(conf);

  app.get('/api/rbac-test-success', requirePermission('view role test'), (req, res) => {
    res.send('You should see this!');
  });

  app.get('/api/rbac-test-fail', requirePermission('perform other action'), (req, res) => {
    res.send('You should not see this!');
  });
}
