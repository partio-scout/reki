import loopback from 'loopback';
import path from 'path';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackConfig from './../../../webpack.development.config.babel';
import httpProxy from 'http-proxy';

const publicPath = path.resolve(__dirname, '../../public');
const indexFilePath = path.resolve(publicPath, 'index.html');

function startDevServer() {

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

export default function(server) {
  server.on('started', () => {
    if (server.get('isDev')) {
      startDevServer();
      redirectBuildPathToDevServer(server);
    }

    server.use(loopback.static(publicPath));
    server.get('*', (req, res) => res.sendFile(indexFilePath));
  });
}
