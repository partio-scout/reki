/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import { readFileSync } from 'fs'
import {
  createFixtures,
  createUserWithRoles,
  deleteFixturesIfExist,
  deleteAllFixtures,
} from '../../../utils/test-utils'
import {
  initializeSequelize,
  initializeModels,
} from '../../../../src/server/models'

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const sequelize = initializeSequelize()
  const models = initializeModels(sequelize)

  on('task', {
    createUser(overrides) {
      return createUserWithRoles(
        models,
        ['registryUser', 'registryAdmin'],
        overrides,
      )
    },
    async loadFixtures(file) {
      const fixtures = JSON.parse(
        readFileSync(`${__dirname}/../fixtures/${file}`),
      )
      await createFixtures(models, fixtures)
      return true
    },
    deleteFixtures(modelName) {
      return deleteFixturesIfExist(models, modelName)
    },
    async deleteAllFixtures() {
      await deleteAllFixtures(models)
      return true
    },
  })
}
