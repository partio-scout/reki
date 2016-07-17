// The purpose of this file is to initialize babel and load the application
// For documentation on babel, see: http://babeljs.io/

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

require('babel-register');
require('./server');
