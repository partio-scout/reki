import express from 'express';
import path from 'path';
import expressEnforcesSsl from 'express-enforces-ssl';
import helmet from 'helmet';

import updateDatabase from './boot/01-update-database';
import errorHandling from './boot/02-error-handling';
import config from './boot/03-config';
import options from './boot/03-options';
import participantDate from './boot/03-participant-date';
import participant from './boot/03-participant';
import searchFilter from './boot/03-search-filter';
import frontend from './boot/06-frontend';
import monitoring from './boot/07-monitoring';
import restOfApi404 from './boot/99-rest-of-api-404';

const morgan = require('morgan');

const app = express();

export default app;

const bootstrapFileName = path.resolve(__dirname, 'bootstrap.js');
app.set('standalone', require.main.filename === bootstrapFileName);
app.set('isDev', process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test' );
app.set('useDevServer', process.env.NODE_ENV === 'dev' && app.get('standalone'));

if ( !app.get('isDev') ) {
  app.enable('trust proxy');
  app.use(expressEnforcesSsl());
}

app.use(helmet());
app.use(helmet.noCache()); // noCache disabled by default

if (app.get('standalone')) {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
async function boot() {
  await updateDatabase(app);
  errorHandling(app);
  config(app);
  options(app);
  participantDate(app);
  participant(app);
  searchFilter(app);
  frontend(app);
  monitoring(app);
  restOfApi404(app);

  // start the server if `$ node server.js`
  if (app.get('standalone')) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      app.emit('started');
      console.log(`Web server listening at: http://localhost:${port}`);
    });
  }
}

boot().catch(e => {
  console.log('Application boot failed:', e);
  process.exit(-1);
});
