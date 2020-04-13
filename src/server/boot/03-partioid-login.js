import fs from 'fs';
import { models } from '../models';
import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import path from 'path';
import { URL } from 'url';

export default function(app) {
  const rekiBaseUrl = new URL(process.env.REKI_BASE_URL || 'http://localhost:3000');

  const useProductionPartioID = process.env.PARTIOID_USE_PRODUCTION === 'true';
  const partioIDRemoteName = useProductionPartioID ? 'id' : 'partioid-test';
  const partioIdIssuer = rekiBaseUrl.href;
  const partioIdEntryPoint = `https://${partioIDRemoteName}.partio.fi/simplesaml/saml2/idp/SSOService.php`;
  const partioIdLogoutUrl = `https://${partioIDRemoteName}.partio.fi/simplesaml/saml2/idp/SingleLogoutService.php`;
  const partioIdCertificate = fs.readFileSync(path.resolve(`./certs/partioid/${partioIDRemoteName}.crt`), 'utf-8');

  const strategy =  new SamlStrategy(
    {
      callback: new URL('/saml/consume', rekiBaseUrl).href,
      issuer: partioIdIssuer,
      entryPoint: partioIdEntryPoint,
      cert: partioIdCertificate,
      logoutUrl: partioIdLogoutUrl,
      logoutCallbackUrl: 'http://localhost:3000/saml/consume-logout',
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:transient',
    },
    async (profile, done) => {
      try {
        if (!profile || !profile.membernumber) {
          done(null, false, { message: 'Jäsennumero puuttuu PartioID-vastauksesta.' });
          return;
        }

        const user = await models.User.findOne({
          where: {
            memberNumber: String(profile.membernumber),
          },
          include: [
            {
              model: models.UserRole,
              as: 'roles',
            },
          ],
        });

        if (!user) {
          done(null, false, { message: 'PartioID:llä ei löytynyt käyttäjää - varmista, että käyttäjän jäsennumero on oikein.' });
          return;
        } else if (user.blocked) {
          done(null, false, { message: 'Käyttäjän sisäänkirjautuminen on estetty' });
          return;
        } else {
          done(null, models.User.toClientFormat(user, 'partioid'));
          return;
        }
      } catch (e) {
        done(e);
        return;
      }
    },
  );

  passport.use('partioid', strategy);

  app.get('/login/partioid', passport.authenticate('partioid', { successRedirect: '/', failureRedirect: '/', failureFlash: true }));

  app.get('/logout', (req, res, next) => {
    if (req.user && req.user.sessionType === 'partioid') {
      strategy.logout(req, (err, request) => {
        if (err) {
          next(err);
        } else {
          res.redirect(request);
        }
      });
    } else {
      req.logout();
      res.redirect(303, '/login');
    }
  });

  app.post('/saml/consume', passport.authenticate('partioid', { successRedirect: '/', failureRedirect: '/', failureFlash: true }));

  app.post('/saml/consume-logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/saml/metadata', (req, res) => {
    res.type('application/xml');
    res.status(200).send(strategy.generateServiceProviderMetadata());
  });

  app.get('/saml/metadata.php', (req, res) =>{
    res.status(200)
      .type('text/plain')
      .send(`$metadata[${partioIdIssuer}] = array(
    'AssertionConsumerService' => '${partioIdIssuer}saml/consume',
    'SingleLogoutService' => '${partioIdIssuer}saml/logout'
);`);
  });
}
