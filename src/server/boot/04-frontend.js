const loopback = require('loopback');
const path = require('path');

module.exports = function(server) {
  server.on('started', function() {
    const publicPath = path.resolve(__dirname, '../../public');
    server.use(loopback.static(publicPath));
  });
};
