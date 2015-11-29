const loopback = require('loopback');
const path = require('path');

const publicPath = path.resolve(__dirname, '../../public');

function startDevServer() {
  const webpack = require('webpack');
  const WebpackDevServer = require('webpack-dev-server');
  const webpackConfig = require('./../../../webpack.development.config');

  let bundleStart = null;
  const compiler = webpack(webpackConfig);
  compiler.plugin('compile', () => {
    console.log('Bundling project, please wait...');
    bundleStart = Date.now();
  });
  compiler.plugin('done', () => console.log(`Bundled in ${Date.now() - bundleStart} ms!`));

  const bundler = new WebpackDevServer(compiler, {
    publicPath: '/build/',
    inline: true,
    hot: true,
    quiet: false,
    noInfo: true,
    stats: {
      colors: true,
    },
  });

  bundler.listen(3001, 'localhost');
}

function redirectBuildPathToDevServer(server) {
  const httpProxy = require('http-proxy');
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    ws: true,
  });

  server.all('/build/*', (req, res) => proxy.web(req, res, { target: 'http://127.0.0.1:3001' }));
  server.all('/sockjs-node/*', (req, res) => proxy.web(req, res, { target: 'http://127.0.0.1:3001' }));

  // Just catch all errors, don't care about how to treat them
  proxy.on('error', e => console.error(e));

  server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
}

module.exports = function(server) {
  server.on('started', () => {
    if (server.get('isDev')) {
      startDevServer();
      redirectBuildPathToDevServer(server);
    }

    server.use(loopback.static(publicPath));
  });
};
