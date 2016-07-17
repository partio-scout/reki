import Promise from 'bluebird';
import fs from 'fs';
import { SAML } from 'passport-saml';
import path from 'path';

const useProductionPartioID = process.env.PARTIOID_USE_PRODUCTION === 'true';
const partioIDRemoteName = useProductionPartioID ? 'id' : 'qaid';
const conf = {
  path: '/auth/partioid',
  issuer: process.env.PARTIOID_SP_ISSUER || 'http://localhost:3000',
  entryPoint: `https://${partioIDRemoteName}.partio.fi/simplesaml/saml2/idp/SSOService.php`,
  cert: fs.readFileSync(path.join(__dirname,'..', '..', '..', 'certs', 'partioid', `${partioIDRemoteName}.crt`)).toString(),
};
const partioid = new SAML(conf);

export default function(app) {
  const isProduction = !app.get('isDev');
  const cookieOptions = isProduction ? { secure: true } : undefined;

  const getAuthorizeUrl = Promise.promisify(partioid.getAuthorizeUrl, { context: partioid });
  const validatePostResponse = Promise.promisify(partioid.validatePostResponse, { context: partioid });
  const findOneUser = Promise.promisify(app.models.RegistryUser.findOne, { context: app.models.RegistryUser });
  const destroyAccessTokens = Promise.promisify(app.models.AccessToken.destroyAll, { context: app.models.AccessToken });

  app.get('/saml/login', (req, res) =>
    getAuthorizeUrl(req)
      .then(url => res.redirect(url))
      .catch(err => processError(req, res, err))
  );

  app.post('/saml/consume', (req, res) =>
    validatePostResponse(req.body)
      .then(getWhereFilter)
      .then(findOneUser)
      .then(user => loginUser(user, app))
      .tap(([accessToken]) => destroyAccessTokens({ and: [{ id: { neq: accessToken.id } }, { userId: accessToken.userId }] }))
      .spread((accessToken, user) => setCookieAndFinishRequest(accessToken, user, cookieOptions, res))
      .catch(err => processError(req, res, err))
  );
}

function processError(req, res, err) {
  res.status(500).send('Oho! Nyt tapahtui virhe. Jos tällaista tapahtuu uudelleen, ole yhteydessä digitaaliset.palvelut@roihu2016.fi. Sori! :(');
  console.error(err);
}

function getWhereFilter(samlResult) {
  if (samlResult && samlResult.membernumber) {
    return {
      where: {
        memberNumber: samlResult.membernumber,
      },
    };
  } else {
    throw new Error('Jäsennumero puuttuu PartioID-vastauksesta.');
  }
}

function loginUser(user, app) {
  if (user === null) {
    throw new Error('PartioID:llä ei löytynyt käyttäjää - varmista, että käyttäjän jäsennumero on oikein.');
  }

  if (app.models.RegistryUser.isBlocked(user)) {
    throw new Error('Käyttäjän sisäänkirjautuminen on estetty');
  }

  return new Promise((resolve, reject) => {
    user.createAccessToken(4*3600, (err, accessToken) => {
      if (err) {
        reject(err);
      } else {
        resolve([accessToken, user]);
      }
    });
  });
}

function setCookieAndFinishRequest(accessToken, user, cookieOptions, res) {
  accessToken.email = user.email;

  res.cookie('accessToken', JSON.stringify(accessToken), cookieOptions);

  res.redirect('/');
}
