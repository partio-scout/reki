import loopback from 'loopback';
import path from 'path';
import crypto from 'crypto';
import expressEnforcesSsl from 'express-enforces-ssl';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import flash from 'connect-flash';
import redis from 'redis';
import RedisStoreConstructor from 'connect-redis';

import updateDatabase from './boot/01-update-database';
import errorHandling from './boot/02-error-handling';
import accessControl from './boot/02-new-access-control';
import config from './boot/03-config';
import options from './boot/03-options';
import participantDate from './boot/03-participant-date';
import participant from './boot/03-participant';
import partioidLogin from './boot/03-partioid-login';
import offlineLogin from './boot/03-offline-login';
import registryUser from './boot/03-registry-user';
import searchFilter from './boot/03-search-filter';
import restApi from './boot/04-rest-api';
import frontend from './boot/06-frontend';
import monitoring from './boot/07-monitoring';
import restOfApi404 from './boot/99-rest-of-api-404';
import { models } from './models';

const app = loopback();

export default app;

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app);

async function boot(app) {
  app.set('env', process.env.NODE_ENV || 'development');
  app.set('port', process.env.PORT || 3000);
  app.set('logoutSessionsOnSensitiveChanges', true);

  const bootstrapFileName = path.resolve(__dirname, 'bootstrap.js');
  app.set('standalone', require.main.filename === bootstrapFileName);
  app.set('isDev', process.env.NODE_ENV !== 'production');
  app.set('useDevServer', app.get('isDev') && app.get('standalone'));

  let sessionStore = undefined;

  if ( !app.get('isDev') ) {
    app.enable('trust proxy');
    app.use(expressEnforcesSsl());
    const RedisStore = RedisStoreConstructor(session);
    sessionStore = new RedisStore({ client: redis.createClient(process.env.REDIS_URL) });
  }

  const cookieSecret = process.env.COOKIE_SECRET || getSecureRandomString();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({
    secret: cookieSecret,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 4*60*60*1000,
      secure: !app.get('isDev'),
    },
    resave: false,
    store: sessionStore,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  passport.serializeUser((user, done) => { done(null, user.memberNumber); });
  passport.deserializeUser(async (memberNumber, done) => {
    try {
      const user = await models.User.findOne({
        where: {
          memberNumber: String(memberNumber),
        },
        include: [
          { model: models.UserRole, as: 'roles' },
        ],
      });

      if (!user) {
        throw new Error('User not found');
      }

      done(null, models.User.toClientFormat(user));
    } catch (e) {
      done(e);
    }
  });

  app.use(helmet());
  app.use(helmet.noCache()); // noCache disabled by default

  if (app.get('standalone')) {
    app.use(morgan('dev'));
  }

  const validConnectSrc = app.get('isDev') ? ['*'] : ["'self'"];

  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: validConnectSrc,
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'"],
    },
  }));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal server error');
  });

  await updateDatabase(app);
  errorHandling(app);
  accessControl(app);
  config(app);
  options(app);
  participantDate(app);
  participant(app);
  partioidLogin(app);
  offlineLogin(app);
  registryUser(app);
  searchFilter(app);
  restApi(app);
  frontend(app);
  monitoring(app);
  restOfApi404(app);

  app.get('/flashes', (req, res) => res.json(req.flash()));

  // start the server if `$ node server.js`
  if (app.get('standalone')) {
    return app.listen(() => {
      app.emit('started');
      console.log('Web server listening at: %s', app.get('url'));
    });
  }
}

function getSecureRandomString() {
  const buf = Buffer.alloc(32);
  crypto.randomFillSync(buf);
  return buf.toString('base64');
}
