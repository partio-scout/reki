export default function (app) {
  function wrap(routeHandler) {
    return async (req, res, next) => {
      try {
        await routeHandler(req, res)
      } catch (err) {
        next(err)
      }
    }
  }

  app.wrap = wrap
}
