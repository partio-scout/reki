import express from 'express'
import path from 'path'
import crypto from 'crypto'
import expressEnforcesSsl from 'express-enforces-ssl'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import passport from 'passport'
import session from 'express-session'
import flash from 'connect-flash'
import redis from 'redis'
import RedisStoreConstructor from 'connect-redis'

import updateDatabase from './boot/01-update-database'
import errorHandling from './boot/02-error-handling'
import accessControl from './boot/02-new-access-control'
import config from './boot/03-config'
import options from './boot/03-options'
import participantDate from './boot/03-participant-date'
import participant from './boot/03-participant'
import partioidLogin from './boot/03-partioid-login'
import offlineLogin from './boot/03-offline-login'
import registryUser from './boot/03-registry-user'
import restApi from './boot/04-rest-api'
import frontend from './boot/06-frontend'
import monitoring from './boot/07-monitoring'
import restOfApi404 from './boot/99-rest-of-api-404'
import { models } from './models'

const app = express()

export default app

const bootstrapFileName = path.resolve(__dirname, 'server.js')
const standalone = require.main.filename === bootstrapFileName
const isDev = process.env.NODE_ENV !== 'production'
export const appConfig = {
  port: process.env.PORT || 3000,
  standalone,
  isDev,
  useDevServer: isDev && standalone,
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app)

async function boot(app) {
  let sessionStore = undefined

  if (!appConfig.isDev) {
    app.enable('trust proxy')
    app.use(expressEnforcesSsl())
  }

  if (process.env.REDIS_URL) {
    const RedisStore = RedisStoreConstructor(session)
    sessionStore = new RedisStore({
      client: redis.createClient(process.env.REDIS_URL),
    })
  }

  const cookieSecret = process.env.COOKIE_SECRET || getSecureRandomString()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(
    session({
      secret: cookieSecret,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 4 * 60 * 60 * 1000,
        secure: !appConfig.isDev,
        sameSite: 'lax',
      },
      resave: false,
      store: sessionStore,
    }),
  )
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  passport.serializeUser((user, done) => {
    done(null, {
      memberNumber: user.memberNumber,
      sessionType: user.sessionType,
    })
  })
  passport.deserializeUser(async ({ memberNumber, sessionType }, done) => {
    try {
      const user = await models.User.findOne({
        where: {
          memberNumber: String(memberNumber),
        },
        include: [{ model: models.UserRole, as: 'roles' }],
      })

      if (!user) {
        throw new Error('User not found')
      }

      done(null, models.User.toClientFormat(user, sessionType))
    } catch (e) {
      done(e)
    }
  })

  app.use(helmet())
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  if (appConfig.standalone) {
    app.use(morgan('dev'))
  }

  const validConnectSrc = appConfig.isDev ? ['*'] : ["'self'"]

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: validConnectSrc,
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'"],
        fontSrc: ['https://fonts.gstatic.com'],
      },
    }),
  )

  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('Internal server error')
  })

  await updateDatabase(app)
  errorHandling(app)
  accessControl(app)
  config(app)
  options(app)
  participantDate(app)
  participant(app)
  partioidLogin(app)
  offlineLogin(app)
  registryUser(app)
  restApi(app)
  monitoring(app)
  restOfApi404(app)
  app.get('/flashes', (req, res) => res.json(req.flash()))
  frontend(app)

  // start the server if `$ node server.js`
  if (appConfig.standalone) {
    return app.listen(appConfig.port, () => {
      console.log('Web server listening at: %s', appConfig.port)
    })
  }
}

function getSecureRandomString() {
  const buf = Buffer.alloc(32)
  crypto.randomFillSync(buf)
  return buf.toString('base64')
}
