/*
 * Our WebdriverIO + Node versions don't support ES6, so this file isn't checked by ESLint.
 * Upgrade this file to ES6 after updating Node.
 */

var appProcess;

exports.config = {
  specs: [
    './test/e2e/**/*.test.js',
  ],
  capabilities: [{
    browserName: 'firefox',
  }],
  logLevel: 'silent',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: 'http://localhost:3005',
  waitforTimeout: 10000,
  framework: 'mocha',
  reporter: 'spec',
  mochaOpts: {
    ui: 'bdd',
    timeout: 10000,
    compilers: ['js:babel-register'],
  },

  before: function() {

    // Initialize Chai As Promised assertion library
    var chai = require('chai');
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = chai.expect;
    chai.Should();
    chaiAsPromised.transferPromiseness = browser.transferPromiseness;

    // Start the app
    var options = process.env;
    options.PORT = 3005;
    return new Promise((resolve, reject) => {
      appProcess = require('child_process').spawn('node', ['.'], options);
      appProcess.stdout.on('data', data => {

        // This is ugly, but only way to know the app is ready to accept connections
        var dataString = data.toString();
        if (dataString && dataString.indexOf('listening') !== -1) {
          resolve();
        }

      });
    });
  },

  after: function() {
    appProcess.kill();
  },
};
