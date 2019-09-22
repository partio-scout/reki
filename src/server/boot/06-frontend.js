import express from 'express';
import path from 'path';

const publicPath = path.resolve('./dist/public');

const index = `
<!DOCTYPE html>
<html lang="fi">
  <head>
    <title>REKI</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="app"></div>
    <script src="/assets/bundle.js" async></script>
  </body>
</html>`;

export default function(server) {
  server.use('/assets', express.static(publicPath));
  server.get('*', (req, res) => res.type('html').send(index));
}
