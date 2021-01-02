import express from 'express'
import path from 'path'
import Sequelize from 'sequelize'
import { updateDatabase } from './models'
import { configureApp } from './server'
import { initializeSequelize, initializeModels, Models } from './models'

const bootstrapFileName = path.resolve(__dirname, 'boot.js')
const standalone = require.main!.filename === bootstrapFileName
const isDev = process.env.NODE_ENV !== 'production'
const portFromEnv = Number(process.env.PORT)
const port = Number.isNaN(portFromEnv) ? 3000 : portFromEnv

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
// start the server if `$ node server.js`
if (standalone) {
  const sequelize = initializeSequelize()
  const models = initializeModels(sequelize)

  const app = configureApp(standalone, isDev, sequelize, models)
  boot(app, sequelize, models)
}

async function boot(
  app: express.Application,
  sequelize: Sequelize.Sequelize,
  models: Models,
): Promise<void> {
  await updateDatabase(sequelize, models, isDev)

  app.listen(port, () => {
    console.log('Web server listening at: %s', port)
  })
}
