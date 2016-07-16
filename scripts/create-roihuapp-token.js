import Promise from 'bluebird';
import app from '../src/server/server.js';
import crypto from 'crypto';

const lifeTime = process.argv[2];
if (!lifeTime) {
  console.log('You must specify token lifetime in seconds - node create-roihuapp-token.js <lifetime>');
  process.exit(1);
}

const {
  RegistryUser,
  Role,
  RoleMapping,
} = app.models;

const createUser = Promise.promisify(RegistryUser.create, { context: RegistryUser });
const findUser = Promise.promisify(RegistryUser.findOne, { context: RegistryUser });
const findRole = Promise.promisify(Role.findOne, { context: Role });
const createRoleMapping = Promise.promisify(RoleMapping.create, { context: RoleMapping });

function addRolesToUser(userId, rolename) {
  return findRole({ where: { name: rolename } })
    .then(role => createRoleMapping({
      'principalType': 'USER',
      'principalId': userId,
      'roleId': role.id,
    }));
}

function findOrCreateAppUser(name) {
  return findUser({ where: { username: name } })
  .then(user => {
    if (user) {
      return user;
    } else {
      return createUser({
        firstName: 'roihuapp',
        lastName: 'roihuapp',
        username: name,
        email: 'not_actual_roihuapp_email@roihu2016.fi',
        password: crypto.randomBytes(24).toString('hex'),
        lastModified: new Date(),
      })
      .then(user => addRolesToUser(user.id, 'roihuapp'));
    }
  });
}

findOrCreateAppUser('roihuapp-user')
.then(user => Promise.fromCallback(callback => user.createAccessToken(lifeTime, callback)))
.then(accessToken => console.log(`Accesstoken: ${accessToken.id} lifetime ${lifeTime} seconds`))
.catch(err => console.error('Can\'t generate access token:', err))
.finally(() => process.exit(0));
