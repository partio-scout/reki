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
  baseUrl: 'http://localhost:' + (process.env.PORT),
  waitforTimeout: 10000,
  framework: 'mocha',
  reporter: 'spec',
  mochaOpts: {
    ui: 'bdd',
    timeout: 10000,
    require: ['babel-register', 'babel-polyfill'],
  },

  before: function() {
    // Initialize Chai As Promised assertion library
    var chai = require('chai');
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = chai.expect;
    chai.Should();
    chaiAsPromised.transferPromiseness = browser.transferPromiseness;
  },

};
