import { readFileSync } from 'fs';
import path from 'path';
import setupAccessControl from '../middleware/access-control.js';

export default function(app) {

  const permissionsFile = path.join(__dirname,'..', '..', '..', 'conf', 'permissions.json');
  const permissions = JSON.parse(readFileSync(permissionsFile));
  const requirePermission = setupAccessControl(app, permissions);
  app.requirePermission = requirePermission;

  // Endpoints for testing

  app.get('/api/test/rbac-test-success', app.requirePermission('perform allowed test action'), (req, res) => {
    res.send('You should see this!');
  });

  app.get('/api/test/rbac-test-fail', app.requirePermission('perform disallowed test action'), (req, res) => {
    res.send('You should not see this!');
  });
}
