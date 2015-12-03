const loopback = require('loopback');
const path = require('path');

const publicPath = path.resolve(__dirname, '../../public');

module.exports = function(server) {
  server.on('started', () => server.use(loopback.static(publicPath)));
};
