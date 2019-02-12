import fs from 'fs';
import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import path from 'path';
import { fromCallback } from '../util/promises';

export default function(app) {
  const useProductionPartioID = process.env.PARTIOID_USE_PRODUCTION === 'true';
  const partioIDRemoteName = useProductionPartioID ? 'id' : 'partioid-test';
  const partioIdIssuer = process.env.PARTIOID_SP_ISSUER || 'http://localhost:3000';
  const partioIdEntryPoint = `https://${partioIDRemoteName}.partio.fi/simplesaml/saml2/idp/SSOService.php`;
  const partioIdCertificate = fs.readFileSync(path.join(__dirname,'..', '..', '..', 'certs', 'partioid', `${partioIDRemoteName}.crt`), 'utf-8');

  passport.use('partioid',
    new SamlStrategy(
      {
        path: '/saml/consume',
        issuer: partioIdIssuer,
        entryPoint: partioIdEntryPoint,
        cert: partioIdCertificate,
      },
      async (profile, done) => {
        try {
          if (!profile || !profile.membernumber) {
            done(null, false, { message: 'Jäsennumero puuttuu PartioID-vastauksesta.' });
            return;
          }

          const user = await fromCallback(cb => app.models.RegistryUser.findOne({
            where: {
              memberNumber: String(profile.memberNumber),
            },
            include: 'rekiRoles',
          }, cb));

          if (!user) {
            done(null, false, { message: 'PartioID:llä ei löytynyt käyttäjää - varmista, että käyttäjän jäsennumero on oikein.' });
            return;
          } else if (app.models.RegistryUser.isBlocked(user)) {
            done(null, false, { message: 'Käyttäjän sisäänkirjautuminen on estetty' });
            return;
          } else {
            done(null, user.toJSON());
            return;
          }
        } catch (e) {
          done(e);
          return;
        }
      })
  );

  app.get('/login/partioid', passport.authenticate('partioid', { successRedirect: '/', failureRedirect: '/', failureFlash: true }));

  app.post('/saml/consume', passport.authenticate('partioid', { successRedirect: '/', failureRedirect: '/', failureFlash: true }));
}
