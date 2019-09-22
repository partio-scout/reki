import express from 'express';
import path from 'path';

const publicPath = path.resolve('./dist/public');

const index = user => `
<!DOCTYPE html>
<html lang="fi">
  <head>
    <title>REKI</title>
    <meta charset="UTF-8" />
    <script id="user-info" type="application/json">${JSON.stringify(user)}</script>
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Sans+Pro:wght@900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script src="/assets/bundle.js" async></script>
  </body>
</html>`;

const offlineLoginForm = process.env.ENABLE_OFFLINE_LOGIN === 'true'
  ? '<a class="btn" href="/login/password">Kirjaudu sähköpostilla ja salasanalla</a>'
  : '';

const loginPage = `
<!DOCTYPE html>
<html lang="fi">
  <head>
    <title>REKI</title>
    <meta charset="UTF-8" />
    <style>
      html {
        height: 100%;
      }
      body {
        background-color: #f7f7f5;
        margin: 0;
        min-height: 100%;
        padding: 0;
        position: absolute;
        width: 100%;
      }
      .centered {
        margin: 0 auto;
      }
      .mainContent {
        width: 20em;
      }
      .mainContent > * + * {
        margin-top: 2em;
      }
      .btn {
        background-color: #253764;
        border-radius: 0.25em;
        border: none;
        box-sizing: border-box;
        color: white;
        display: block;
        font-family: sans-serif;
        font-weight: bold;
        padding: 1em 1.5em;
        text-align: center;
        text-decoration: none;
        transition: 100ms all linear;
      }
      .btn:hover {
        background-color: #39549a;
      }
    </style>
  </head>
  <body>
    <div class="centered mainContent">
      <h1>REKI</h1>
      <a class="btn" href="/login/partioid">Kirjaudu partioidllä</a>
      ${offlineLoginForm}
    </div>
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
      res.type('html').send(index(req.user));
    } else {
      res.redirect(303, '/login');
    }
  });
}
