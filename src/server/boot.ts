import express from 'express'
import path from 'path'
import { updateDatabase } from './models'
import { configureApp } from './server'

const bootstrapFileName = path.resolve(__dirname, 'boot.js')
const standalone = require.main!.filename === bootstrapFileName
const isDev = process.env.NODE_ENV !== 'production'
const portFromEnv = Number(process.env.PORT)
const port = Number.isNaN(portFromEnv) ? 3000 : portFromEnv

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
// start the server if `$ node server.js`
if (standalone) {
  const app = configureApp(standalone, isDev)
  boot(app)
}

async function boot(app: express.Application): Promise<void> {
  await updateDatabase(isDev)

  app.listen(port, () => {
    console.log('Web server listening at: %s', port)
  })
}
