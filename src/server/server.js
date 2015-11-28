// Since this file is the one to call babel-core/register, it is the only one that doesn't support es6 syntax
require('babel-core/register');

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

app.set('standalone', require.main === module);
app.set('isDev', process.env.NODE_ENV === 'dev');

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (app.get('standalone'))
    app.start();
});
