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
import Router from 'express-promise-router'
import _ from 'lodash'
import { Sequelize, Op } from 'sequelize'
import fs from 'fs'
import {
  Strategy as SamlStrategy,
  Profile as SamlProfile,
  VerifiedCallback as SamlVerifiedCallback,
} from 'passport-saml'
import argon2 from 'argon2'
import { BasicStrategy } from 'passport-http'
import * as Rt from 'runtypes'
import { URL } from 'url'

import * as config from './conf'
import { Models } from './models'
import optionalBasicAuth from './middleware/optional-basic-auth'
import setupAccessControl from './middleware/access-control'
import { getClientData } from './util/audit'
import {
  participantListColumns,
  quickFilterConfiguration,
} from './temporaryFixedData'

type RouteInfo =
  | { route: 'participantsList' }
  | { route: 'participantDetails'; participantId: string }
  | { route: 'admin' }
  | { route: 'auditLog' }
  | { route: 'homePage' }

const index = (user: Express.User, routeInfo: RouteInfo) => `
<!DOCTYPE html>
<html lang="fi">
  <head>
    <title>REKI</title>
    <meta charset="UTF-8" />
    <script id="user-info" type="application/json">${JSON.stringify(
      user,
    )}</script>
    <script id="route-info" type="application/json">${JSON.stringify(
      routeInfo,
    )}</script>
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Sans+Pro:wght@900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script src="/assets/bundle.js" async></script>
  </body>
</html>`

const offlineLoginForm =
  process.env.ENABLE_OFFLINE_LOGIN === 'true'
    ? '<a class="btn" href="/login/password">Kirjaudu sähköpostilla ja salasanalla</a>'
    : ''

const loginPage = `
<!DOCTYPE html>
<html lang="fi">
  <head>
    <title>REKI</title>
    <meta charset="UTF-8" />
    <style>
      html {
        height: 100%;
      }
      body {
        background-color: #f7f7f5;
        margin: 0;
        min-height: 100%;
        padding: 0;
        position: absolute;
        width: 100%;
      }
      .centered {
        margin: 0 auto;
      }
      .mainContent {
        width: 20em;
      }
      .mainContent > * + * {
        margin-top: 2em;
      }
      .btn {
        background-color: #253764;
        border-radius: 0.25em;
        border: none;
        box-sizing: border-box;
        color: white;
        display: block;
        font-family: sans-serif;
        font-weight: bold;
        padding: 1em 1.5em;
        text-align: center;
        text-decoration: none;
        transition: 100ms all linear;
      }
      .btn:hover {
        background-color: #39549a;
      }
    </style>
  </head>
  <body>
    <div class="centered mainContent">
      <h1>REKI</h1>
      <a class="btn" href="/login/partioid">Kirjaudu partioidllä</a>
      ${offlineLoginForm}
    </div>
  </body>
</html>`

export function configureApp(
  standalone: boolean,
  isDev: boolean,
  sequelize: Sequelize,
  models: Models,
): express.Application {
  const app = express()

  let sessionStore = undefined

  if (!isDev) {
    app.enable('trust proxy')
    app.use(expressEnforcesSsl())
  }

  if (!isDev && !process.env.REDIS_URL) {
    throw new Error(
      'When running in production mode, REDIS_URL needs to be defined',
    )
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
        secure: !isDev,
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

  const rekiBaseUrl = new URL(
    process.env.REKI_BASE_URL || 'http://localhost:3000',
  )

  const useProductionPartioID = process.env.PARTIOID_USE_PRODUCTION === 'true'
  const partioIDRemoteName = useProductionPartioID ? 'id' : 'partioid-test'
  const partioIdIssuer = rekiBaseUrl.href
  const partioIdEntryPoint = `https://${partioIDRemoteName}.partio.fi/simplesaml/saml2/idp/SSOService.php`
  const partioIdLogoutUrl = `https://${partioIDRemoteName}.partio.fi/simplesaml/saml2/idp/SingleLogoutService.php`
  const partioIdCertificate = fs.readFileSync(
    path.resolve(`${__dirname}/../../certs/partioid/${partioIDRemoteName}.crt`),
    'utf-8',
  )

  const strategy = new SamlStrategy(
    {
      callbackUrl: new URL('/saml/consume', rekiBaseUrl).href,
      issuer: partioIdIssuer,
      entryPoint: partioIdEntryPoint,
      cert: partioIdCertificate,
      logoutUrl: partioIdLogoutUrl,
      logoutCallbackUrl: new URL('/saml/consume-logout', rekiBaseUrl).href,
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:transient',
    },
    async (
      profile: SamlProfile | null | undefined,
      done: SamlVerifiedCallback,
    ) => {
      try {
        if (!profile || !profile.membernumber) {
          done(new Error('Jäsennumero puuttuu PartioID-vastauksesta.'))
          return
        }

        const user = await models.User.findOne({
          where: {
            memberNumber: String(profile.membernumber),
          },
          include: [
            {
              model: models.UserRole,
              as: 'roles',
            },
          ],
        })

        if (!user) {
          done(
            new Error(
              'PartioID:llä ei löytynyt käyttäjää - varmista, että käyttäjän jäsennumero on oikein.',
            ),
          )
        } else if (user.blocked) {
          done(new Error('Käyttäjän sisäänkirjautuminen on estetty'))
        } else {
          done(null, models.User.toClientFormat(user, 'partioid') as any)
        }
      } catch (e: any) {
        done(e)
      }
    },
  )

  passport.use('partioid', strategy as any) // The typings of passport and passport-saml don't quite match

  const enableOfflineLogin = process.env.ENABLE_OFFLINE_LOGIN === 'true'

  if (enableOfflineLogin) {
    passport.use(
      new BasicStrategy(async (userId, password, done) => {
        try {
          const user = await models.User.findOne({
            where: {
              email: userId,
            },
            include: [{ model: models.UserRole, as: 'roles' }],
          })

          if (!user || user.blocked) {
            return done(null, false)
          }

          const isMatch = await argon2.verify(user.passwordHash, password)

          if (!isMatch) {
            return done(null, false)
          }

          done(null, models.User.toClientFormat(user, 'password'))
        } catch (e) {
          done(e)
        }
      }),
    )
  }

  app.use(helmet())
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  if (standalone) {
    app.use(morgan('dev'))
  }

  const validConnectSrc = isDev ? ['*'] : ["'self'"]

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

  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error(err)
      res.status(500).send('Internal server error')
    },
  )

  const apiRouter = Router()
  app.use('/api', apiRouter)
  const permissions = config.actionPermissions
  const requirePermission = setupAccessControl(app, permissions)

  apiRouter.use((req, res, next) => {
    res.setHeader('Content-Disposition', 'attachment; filename="rest.json"')
    return next()
  })

  apiRouter.get(
    '/test/rbac-test-success',
    optionalBasicAuth(),
    requirePermission('perform allowed test action'),
    (req, res) => {
      res.send('You should see this!')
    },
  )

  apiRouter.get(
    '/test/rbac-test-fail',
    optionalBasicAuth(),
    requirePermission('perform disallowed test action'),
    (req, res) => {
      res.send('You should not see this!')
    },
  )

  apiRouter.get(
    '/options',
    optionalBasicAuth(),
    requirePermission('view participants'),
    async (req, res) => {
      const options = await models.Option.findAll()
      const result: Record<string, string[]> = {}
      for (const { property, value } of options) {
        if (result[property]) {
          result[property].push(value)
        } else {
          result[property] = [value]
        }
      }
      res.json(result)
    },
  )
  apiRouter.get(
    '/participantdates',
    optionalBasicAuth(),
    requirePermission('view participants'),
    async (req, res) => {
      const participantDates = await models.ParticipantDate.findAll({
        order: [['date', 'ASC']],
      })
      const uniqueDates = _.uniqBy<{ date: Date }>(
        participantDates.map((pd) => ({ date: pd.date })),
        (val) => val.date.getTime(),
      )
      res.json(uniqueDates)
    },
  )

  const NonNegativeInteger = Rt.Number.withConstraint(
    (num) => Number.isInteger(num) && num >= 1,
  )
  const GetParticipantParams = Rt.Record({
    id: NonNegativeInteger,
  }).asReadonly()
  const getParticipantParamsGetter = (params: any) =>
    GetParticipantParams.check({ id: Number(params.id) })
  apiRouter.get(
    '/participants/:id(\\d+)',
    optionalBasicAuth(),
    requirePermission('view participants'),
    async (req, res) => {
      const { id } = getParticipantParamsGetter(req.params)

      const participant = await models.Participant.findByPk(id, {
        include: [{ all: true, nested: true }] as any,
      })

      if (participant) {
        await models.AuditEvent.audit({
          ...getClientData(req),
          modelType: 'Participant',
          modelId: participant.participantId,
          eventType: 'find',
        })

        // Using User.toClientFormat ensures that presenceHistory.author does
        // not accidentally leak secret user information such as password hashes
        // otherwise we could just use res.json(participant) which is practically
        // the same as res.json(participant.toJSON())
        res.json({
          ...participant.toJSON(),
          presenceHistory: participant.presenceHistory!.map((it) => ({
            ...it.toJSON(),
            author: models.User.toClientFormat(it.author!),
          })),
        })
      } else {
        res.status(404).send('Not found')
      }
    },
  )

  const ListParticipantsParams = Rt.Record({
    textSearch: Rt.Array(Rt.String).asReadonly(),
    order: Rt.Tuple(Rt.String, Rt.Union(Rt.Literal('ASC'), Rt.Literal('DESC'))),
    fieldFilters: Rt.Array(Rt.Tuple(Rt.String, Rt.String)).asReadonly(),
    dateFilters: Rt.Array(Rt.InstanceOf(Date)),
    limit: NonNegativeInteger.Or(Rt.Undefined),
    offset: NonNegativeInteger.Or(Rt.Undefined),
  }).asReadonly()
  type ListParticipantsParams = Rt.Static<typeof ListParticipantsParams>
  const listParticipantsParamsGetter = (query: any): ListParticipantsParams => {
    const limit = Number(query.limit) || undefined
    const offset = Number(query.offset) || undefined
    const textSearch = query.q ? query.q.split(/\s+/) : []
    const orderBy = query.orderBy || 'participantId'
    const orderDirection = query.orderDirection || 'ASC'
    const order = [orderBy, orderDirection]

    const defaultFieldFilters = Object.entries(query).filter(
      ([key]) =>
        models.Participant.isDefaultField(key) &&
        models.Participant.isSearchableField(key),
    )
    const extraFieldFilters = Object.entries(query)
      .filter(([key]) => !models.Participant.isDefaultField(key))
      .map((k) => [`extraFields.${k[0]}`, k[1]])
    const fieldFilters = [...defaultFieldFilters, ...extraFieldFilters]
    const { dates } = query
    const dateFilters =
      dates && typeof dates === 'string'
        ? dates.split(',').map((x) => new Date(x.trim()))
        : []

    return ListParticipantsParams.check({
      textSearch,
      dateFilters,
      fieldFilters,
      limit,
      offset,
      order,
    })
  }

  apiRouter.get(
    '/participantListFilters',
    optionalBasicAuth(),
    requirePermission('view participants'),
    async (req, res) => {
      await models.AuditEvent.audit({
        ...getClientData(req),
        modelType: 'ParticipantListFilters',
        eventType: 'find',
      })

      res.json(quickFilterConfiguration)
    },
  )

  apiRouter.get(
    '/participants',
    optionalBasicAuth(),
    requirePermission('view participants'),
    async (req, res) => {
      const params = listParticipantsParamsGetter(req.query)
      const where = {
        [Op.and]: [
          ...params.textSearch.map((word) => ({
            [Op.or]: [
              ...Array.from(
                models.Participant.searchableDefaultFieldNames.values(),
              ).map((field) => ({
                [field]: {
                  [Op.iLike]: `%${word}%`,
                },
              })),
              ...config.searchableFieldNames.map((field) => ({
                extraFields: {
                  [field]: {
                    [Op.iLike]: `%${word}%`,
                  },
                },
              })),
            ],
          })),
          ...params.fieldFilters.map(([field, value]) => ({
            [field]: value,
          })),
        ],
      }

      // Date search
      const dateFilter = params.dateFilters.length
        ? {
            date: {
              [Op.in]: params.dateFilters.map((dateStr) => new Date(dateStr)),
            },
          }
        : undefined

      const result = await models.Participant.findAndCountAll({
        where: where,
        include: [
          // Filter results using datesearch
          {
            model: models.ParticipantDate,
            as: 'datesearch',
            where: dateFilter,
          },
          // Get all dates of participant
          {
            model: models.ParticipantDate,
            as: 'dates',
          },
        ],
        offset: params.offset,
        limit: params.limit,
        order: [params.order],
        distinct: true, // without this count is calculated incorrectly
      })

      await models.AuditEvent.audit({
        ...getClientData(req),
        modelType: 'Participant',
        eventType: 'find',
        meta: { params },
      })

      res.json({
        result: result.rows,
        count: result.count,
        columns: participantListColumns,
      })
    },
  )

  const ParticipantsMassAssignBody = Rt.Record({
    ids: Rt.Array(Rt.Number).asReadonly(),
  }).And(
    Rt.Union(
      Rt.Record({
        fieldName: Rt.Union(
          Rt.Literal('editableInfo'),
          Rt.Literal('campOfficeNotes'),
        ),
        newValue: Rt.String,
      }),
      Rt.Record({
        fieldName: Rt.Literal('presence'),
        newValue: Rt.Union(Rt.Literal(1), Rt.Literal(2), Rt.Literal(3)),
      }),
    ),
  )
  apiRouter.post(
    '/participants/massAssign',
    optionalBasicAuth(),
    requirePermission('edit participants'),
    async (req, res) => {
      const body = ParticipantsMassAssignBody.check(req.body)
      const updates = await models.Participant.massAssignField(
        body.ids,
        body.fieldName,
        body.newValue,
        getClientData(req),
      )
      res.json(updates)
    },
  )

  apiRouter.get(
    '/audit-events',
    optionalBasicAuth(),
    requirePermission('view audit log'),
    async (req, res) => {
      const filter = JSON.parse((req.query.filter as string) || '{}')

      const where = filter.where || {}
      const limit = Number(filter.limit) || 250
      const offset = Number(filter.skip) || undefined
      const order = filter.order
        ? filter.order.split(' ')
        : ['timestamp', 'DESC']

      await models.AuditEvent.audit({
        ...getClientData(req),
        modelType: 'AuditEvent',
        eventType: 'find',
        meta: { filter, generatedQuery: { where, offset, limit, order } },
      })

      const events = await models.AuditEvent.findAll({
        include: [{ model: models.User }],
        where,
        limit,
        offset,
        order: [order],
      })

      res.json(events.map(models.AuditEvent.toClientJSON))
    },
  )

  app.get(
    '/login/partioid',
    passport.authenticate(
      'partioid',
      {
        failureRedirect: '/',
        failureFlash: true,
      },
      async (req, res) => {
        const responseType = req.accepts(['json', 'html']) || 'json'
        await models.AuditEvent.audit({
          ...getClientData(req),
          modelId: req.user.id,
          modelType: 'User',
          eventType: 'login',
          meta: { method: 'partioid' },
        })
        if (responseType === 'json') {
          res.status(200).json({ message: 'Login successful' })
        } else {
          res.redirect(303, '/')
        }
      },
    ),
  )

  if (enableOfflineLogin) {
    app.use(
      '/login/password',
      passport.authenticate('basic'),
      async (req, res) => {
        const responseType = req.accepts(['json', 'html']) || 'json'

        const userIdString = req.user?.id
        const userId = userIdString ? Number(userIdString) : undefined

        await models.AuditEvent.audit({
          ...getClientData(req),
          modelId: userId,
          modelType: 'User',
          eventType: 'login',
          meta: { method: 'password' },
        })

        if (responseType === 'json') {
          res.status(200).json({ message: 'Login successful' })
        } else {
          res.redirect(303, '/')
        }
      },
    )
  }

  app.get('/logout', async (req, res, next) => {
    if (req.user) {
      const userIdString = req.user.id
      const userId = userIdString ? Number(userIdString) : undefined

      await models.AuditEvent.audit({
        ...getClientData(req),
        modelId: userId,
        modelType: 'User',
        eventType: 'logout',
      })
    }

    if (req.user && req.user.sessionType === 'partioid') {
      strategy.logout(req as any, (err, request) => {
        if (err) {
          next(err)
        } else {
          res.redirect(request!)
        }
      })
    } else {
      req.logout()
      res.redirect(303, '/login')
    }
  })

  app.post(
    '/saml/consume',
    passport.authenticate('partioid', {
      successRedirect: '/',
      failureRedirect: '/',
      failureFlash: true,
    }),
  )

  app.post('/saml/consume-logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  app.get('/saml/metadata', (req, res) => {
    res.type('application/xml')
    res.status(200).send(strategy.generateServiceProviderMetadata(null))
  })

  app.get('/saml/metadata.php', (req, res) => {
    res.status(200).type('text/plain')
      .send(`$metadata[${partioIdIssuer}] = array(
    'AssertionConsumerService' => '${partioIdIssuer}saml/consume',
    'SingleLogoutService' => '${partioIdIssuer}saml/logout'
);`)
  })

  apiRouter.get(
    '/registryusers',
    optionalBasicAuth(),
    requirePermission('view registry users'),
    async (req, res) => {
      await models.AuditEvent.audit({
        ...getClientData(req),
        modelType: 'User',
        eventType: 'find',
      })

      const users = await models.User.findAll()
      res.json(users.map((user) => models.User.toClientFormat(user)))
    },
  )

  apiRouter.post(
    '/registryusers/:id/block',
    optionalBasicAuth(),
    requirePermission('block and unblock users'),
    async (req, res) => {
      const userId = NonNegativeInteger.check(Number(req.params.id))

      await models.AuditEvent.audit({
        ...getClientData(req),
        modelId: userId,
        modelType: 'User',
        eventType: 'block',
      })

      await models.User.update({ blocked: true }, { where: { id: userId } })
      res.status(204).send('')
    },
  )

  apiRouter.post(
    '/registryusers/:id/unblock',
    optionalBasicAuth(),
    requirePermission('block and unblock users'),
    async (req, res) => {
      const userId = NonNegativeInteger.check(Number(req.params.id))

      await models.AuditEvent.audit({
        ...getClientData(req),
        modelId: userId,
        modelType: 'User',
        eventType: 'unblock',
      })

      await models.User.update({ blocked: false }, { where: { id: userId } })
      res.status(204).send('')
    },
  )

  app.get('/monitoring', async (req, res) => {
    try {
      await sequelize.query('SELECT 1')
      res.status(200).send('OK')
    } catch (err) {
      res.status(500).send('ERROR')
    }
  })

  apiRouter.use((req, res, next) => {
    res.sendStatus(404)
  })

  app.get('/flashes', (req, res) => res.json(req.flash()))

  const publicPath = path.resolve('./dist/public')
  app.use('/assets', express.static(publicPath))
  app.get('/login', (req, res) => {
    if (req.user) {
      res.redirect(303, '/')
    } else {
      res.type('html').send(loginPage)
    }
  })
  app.get('/participants/:id', (req, res) => {
    const participantId = req.params.id
    if (req.user) {
      res
        .type('html')
        .send(index(req.user, { route: 'participantDetails', participantId }))
    } else {
      res.redirect(303, '/login')
    }
  })
  app.get('/participants', (req, res) => {
    if (req.user) {
      res.type('html').send(index(req.user, { route: 'participantsList' }))
    } else {
      res.redirect(303, '/login')
    }
  })
  app.get('/admin', (req, res) => {
    if (req.user) {
      res.type('html').send(index(req.user, { route: 'admin' }))
    } else {
      res.redirect(303, '/login')
    }
  })
  app.get('/audit', (req, res) => {
    if (req.user) {
      res.type('html').send(index(req.user, { route: 'auditLog' }))
    } else {
      res.redirect(303, '/login')
    }
  })
  app.get('/', (req, res) => {
    if (req.user) {
      res.type('html').send(index(req.user, { route: 'homePage' }))
    } else {
      res.redirect(303, '/login')
    }
  })

  app.use(
    (
      error: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (error instanceof Rt.ValidationError) {
        res.sendStatus(400)
      } else {
        next(error)
      }
    },
  )

  return app
}

function getSecureRandomString() {
  const buf = Buffer.alloc(32)
  crypto.randomFillSync(buf)
  return buf.toString('base64')
}
