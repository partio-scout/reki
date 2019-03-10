import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { fromCallback } from '../util/promises';

export default function(app) {
  const enableOfflineLogin = process.env.ENABLE_OFFLINE_LOGIN === 'true';

  if (!enableOfflineLogin) {
    return;
  }

  passport.use(new BasicStrategy(async (userId, password, done) => {
    try {
      const user = await fromCallback(cb => app.models.RegistryUser.findOne({
        where: {
          email: userId,
        },
        include: 'rekiRoles',
      }, cb));

      if (!user || app.models.RegistryUser.isBlocked(user)) {
        return done(null, false);
      }

      const isMatch = await fromCallback(cb => user.hasPassword(password, cb));

      if (!isMatch) {
        return done(null, false);
      }

      done(null, user.toJSON());
    } catch (e) {
      done(e);
    }
  }));

  app.use(
    '/login/password',
    passport.authenticate('basic'),
    (req, res) => {
      const responseType = req.accepts(['json', 'html']) || 'json';
      if (responseType === 'json') {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.redirect(303, '/');
      }
    }
  );
}
