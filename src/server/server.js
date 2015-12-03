// Since this file is the one to call babel-core/register, it is the only one that doesn't es6 module syntax
// Most es6 features are supported by node directly, however. See: https://nodejs.org/en/docs/es6t/
require('babel-core/register');

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

app.set('standalone', require.main === module);
app.set('isDev', process.env.NODE_ENV === 'dev');

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, err => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (app.get('standalone'))
    app.start();
});
