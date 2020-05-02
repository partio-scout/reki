export default function (app) {
  app.use('/api/*', (req, res, next) => {
    res.sendStatus(404)
  })
}
