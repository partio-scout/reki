/*
TODO:
- make the tests work
- some more tests
  - token in different place
  - response content
- move test endpoints to inside test?
- refactor
- move to separate file, add boot script that:
  - reads config
  - sets app.requirePermission
*/

const conf = {
  "registryUser": [
    "view role test"
  ],
  "registryAdmin": [
    "perform other action"
  ]
};

function requirePermissionZ(conf) {
  return function requirePermissionX(perm) {
    return function(req, res, next) {
      /* Something like this:
      token = getToken(req)
      user = getUser(token, include: roles)
      user.roles.each:
        if(perms[roleName].contains(‘perm’)) return next();
        res.send(401);
      */
      next();
    }
  }
}

const requirePermission = requirePermissionZ(conf);

export default function(app) {
  app.get('/api/rbac-test-success', requirePermission('view role test'), (req, res) => {
    res.send('You should see this!');
  });

  app.get('/api/rbac-test-fail', requirePermission('perform other action'), (req, res) => {
    res.send('You should not see this!');
  });
}
