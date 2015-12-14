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

function processError(req, res, err) {
  res.status(500).send('Oho! Nyt tapahtui virhe. Jos tällaista tapahtuu uudelleen, ole yhteydessä digitaaliset.palvelut@roihu2016.fi. Sori! :(');
  console.error(err);
}

export default function(app) {
  app.get('/saml/login', (req, res) =>
    partioid.getAuthorizeUrl(req, (err, url) => {
      if (err) {
        processError(req, res, err);
      } else {
        res.redirect(url);
      }
    })
  );

  app.post('/saml/consume', (req, res) =>
    partioid.validatePostResponse(req.body, (err, samlResult) => {
      if (err) {
        processError(req, res, err);
      } else {
        const query = {
          where: {
            memberNumber: samlResult.membernumber,
          },
        };
        app.models.Registryuser.findOne(query, (err, user) => {
          if (err) {
            res.send('Kirjautuminen epäonnistui tuntemattomasta syystä.');
            console.error(err);
          } else if (user === null) {
            res.send('PartioID:llä ei löytynyt käyttäjää - varmista, että käyttäjän jäsennumero on oikein.');
          } else {
            user.createAccessToken(3600, (err, accessToken) => {
              if (err) {
                processError(req, res, err);
              } else {
                res.cookie('accessToken', JSON.stringify(accessToken));
                res.cookie('email', user.email);
                res.redirect('/');
              }
            });
          }
        });
      }
    })
  );
}
