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

const offlineLoginForm = process.env.ENABLE_OFFLINE_LOGIN === 'true'
  ? '<div><a href="/login/password">Kirjaudu sähköpostilla ja salasanalla</a></div>'
  : '';

const loginPage = `
<!DOCTYPE html>
<html lang="fi">
  <head>
    <title>REKI</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div>
      <a href="/login/partioid">Kirjaudu partioidllä</a>
    </div>
    ${offlineLoginForm}
  </body>
</html>`;

export default function(server) {
  server.use('/assets', express.static(publicPath));
  server.get('/login', (req, res) => {
    if (req.user) {
      res.redirect(303, '/');
    } else {
      res.type('html').send(loginPage);
    }
  });
  server.get('*', (req, res) => {
    if (req.user) {
      res.type('html').send(index);
    } else {
      res.redirect(303, '/login');
    }
  });
}
