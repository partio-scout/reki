import passport from 'passport'
import argon2 from 'argon2'
import { BasicStrategy } from 'passport-http'
import { models } from '../models'

export default function (app) {
  const enableOfflineLogin = process.env.ENABLE_OFFLINE_LOGIN === 'true'

  if (!enableOfflineLogin) {
    return
  }

  passport.use(
    new BasicStrategy(async (userId, password, done) => {
      try {
        const user = await models.User.findOne({
          where: {
            email: userId,
          },
          include: [{ model: models.UserRole, as: 'roles' }],
        })

        if (!user || user.blocked) {
          return done(null, false)
        }

        const isMatch = await argon2.verify(user.passwordHash, password)

        if (!isMatch) {
          return done(null, false)
        }

        done(null, models.User.toClientFormat(user, 'password'))
      } catch (e) {
        done(e)
      }
    }),
  )

  app.use('/login/password', passport.authenticate('basic'), (req, res) => {
    const responseType = req.accepts(['json', 'html']) || 'json'
    if (responseType === 'json') {
      res.status(200).json({ message: 'Login successful' })
    } else {
      res.redirect(303, '/')
    }
  })
}
