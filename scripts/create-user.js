import Promise from 'bluebird';
import app from '../src/server/server.js';
import config from '../src/server/conf';
import crypto from 'crypto';
import inquirer from 'inquirer';
import _ from 'lodash';

const {
  RegistryUser,
  Role,
  RoleMapping,
} = app.models;

const createUser = Promise.promisify(RegistryUser.create, { context: RegistryUser });
const findRoles = Promise.promisify(Role.find, { context: Role });
const createRoleMapping = Promise.promisify(RoleMapping.create, { context: RoleMapping });

const password = crypto.randomBytes(24).toString('hex');
const questions = [
  {
    type: 'input',
    name: 'firstName',
    message: 'First name?',
  },
  {
    type: 'input',
    name: 'lastName',
    message: 'Last name?',
  },
  {
    type: 'input',
    name: 'memberNumber',
    message: 'Member number?',
  },
  {
    type: 'input',
    name: 'phoneNumber',
    message: 'Phone number?',
  },
  {
    type: 'input',
    name: 'email',
    message: 'Email?',
  },
  {
    type: 'checkbox',
    name: 'roles',
    message: 'Choose the roles this user should have',
    choices: config.getRoles().map(role => ({
      name: role,
      value: role,
    })),
  },
];

function printErrorMessage(err) {
  console.error(`Could not create user:
    ${err.stack}`);
}

function addRolesToUser(userId, roleNames) {
  return findRoles({ where: { name: { inq: roleNames } } })
    .then(roles => {
      const roleMappings = _.map(roles, role => ({
        'principalType': 'USER',
        'principalId': userId,
        'roleId': role.id,
      }));

      return createRoleMapping(roleMappings);
    });
}

inquirer.prompt(questions)
  .then(answers => {
    const roles = answers.roles;
    delete answers.roles;

    createUser(Object.assign({ password: password }, answers))
      .then(createdUserInfo => addRolesToUser(createdUserInfo.id, roles)
        .then(() => {
          console.log(`Created user with id ${createdUserInfo.id} with roles ${roles}`);
          process.exit(0);
        })
      )
      .catch(err => {
        printErrorMessage(err);
        process.exit(1);
      });
  });
