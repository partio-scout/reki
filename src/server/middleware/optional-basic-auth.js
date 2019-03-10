import passport from 'passport';

export default function () {
  const authenticate = passport.authenticate('basic', { session: false });

  return function optionalBasicAuth(req, res, next) {
    if (req.get('Authorization')) {
      authenticate(req, res, next);
    } else {
      next();
    }
  };
}
