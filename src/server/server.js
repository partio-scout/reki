import loopback from 'loopback';
import path from 'path';
import expressEnforcesSsl from 'express-enforces-ssl';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import updateDatabase from './boot/01-update-database';
import errorHandling from './boot/02-error-handling';
import accessControl from './boot/02-new-access-control';
import config from './boot/03-config';
import options from './boot/03-options';
import participantDate from './boot/03-participant-date';
import participant from './boot/03-participant';
import partioidLogin from './boot/03-partioid-login';
import registryUser from './boot/03-registry-user';
import searchFilter from './boot/03-search-filter';
import restApi from './boot/04-rest-api';
import devLogin from './boot/05-dev-login';
import frontend from './boot/06-frontend';
import monitoring from './boot/07-monitoring';
import restOfApi404 from './boot/99-rest-of-api-404';

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
  app.set('isDev', process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test' );
  app.set('useDevServer', process.env.NODE_ENV === 'dev' && app.get('standalone'));

  if ( !app.get('isDev') ) {
    app.enable('trust proxy');
    app.use(expressEnforcesSsl());
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(helmet());
  app.use(helmet.noCache()); // noCache disabled by default

  if (app.get('standalone')) {
    app.use(morgan('combined'));
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
  registryUser(app);
  searchFilter(app);
  restApi(app);
  devLogin(app);
  frontend(app);
  monitoring(app);
  restOfApi404(app);

  // start the server if `$ node server.js`
  if (app.get('standalone')) {
    return app.listen(() => {
      app.emit('started');
      console.log('Web server listening at: %s', app.get('url'));
    });
  }
}
