import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 4001;
const password = 'password';
const username = 'username';
const eventid = 'c3ef7c48-1df4-4bf8-b1d0-d523d601a3e1';
const endpoint = `http://localhost:${PORT}`;
let server;

app.logInfo = info => info;
app.logError = err => err;

function serveFixtures(type) {
  const collections = fs.readdirSync(path.resolve(__dirname, `../fixtures/${type}`));
  collections.forEach(collection => {
    app.get(`/${collection}`, (req, res) => {
      if (req.query.Guid !== eventid) {
        res.status(400).send('Wrong or no event id given');
        app.logError('Wrong or no event id given', req.query);
      } else {
        res.set('Content-Type', 'application/json');
        const file = path.resolve(__dirname, `../fixtures/${type}/${collection}`);
        res.send(fs.readFileSync(file));
        app.logInfo(req.path);
      }
    });
  });
}

const mock = {
  password: password,
  username: username,
  eventid: eventid,
  endpoint: endpoint,
  start: () => {
    server = app.listen(PORT);
    return server;
  },
  stop: () => server.close(),
  serveFixtures: serveFixtures,
};

export default mock;

if (require.main === module) {
  app.logInfo = info => console.log('OK:', info);
  app.logError = err => console.error('ERR:', err);
  mock.serveFixtures('all');
  mock.start();
  console.log(`Mock Kuksa running at endpoint ${endpoint}`);
}
