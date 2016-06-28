import loopback from 'loopback';
import boot from 'loopback-boot';
import path from 'path';

const app = loopback();

export default app;

app.start = function() {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

var forceSsl = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

const bootstrapFileName = path.resolve(__dirname, 'bootstrap.js');
app.set('standalone', require.main.filename === bootstrapFileName);
app.set('isDev', process.env.NODE_ENV === 'dev');

if (!app.get('isDev')) {
  app.use(forceSsl);
}

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
