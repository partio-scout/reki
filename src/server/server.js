import loopback from 'loopback';
import boot from 'loopback-boot';
import path from 'path';
import expressEnforcesSsl from 'express-enforces-ssl';
import helmet from 'helmet';

const morgan = require('morgan');

const app = loopback();

export default app;

app.start = function() {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

const bootstrapFileName = path.resolve(__dirname, 'bootstrap.js');
app.set('standalone', require.main.filename === bootstrapFileName);
app.set('isDev', process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test' );

if ( !app.get('isDev') ) {
  app.enable('trust proxy');
  app.use(expressEnforcesSsl());
}

app.use(helmet());
app.use(helmet.noCache()); // noCache disabled by default

if (process.env.NODE_ENV !== 'test') {
  app.middleware('routes:before', morgan('combined'));
}

const validConnectSrc = app.get('isDev') ? ['*'] : ["'self'", `'ws://${process.env.REKI_LOCATION}'`];

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    connectSrc: validConnectSrc,
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'"],
  },
}));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, err => {
  if (err) {
    throw err;
  }

  // start the server if `$ node server.js`
  if (app.get('standalone')) {
    app.start();
  }
});
