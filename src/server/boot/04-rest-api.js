export default function mountRestApi(server) {
  server.use('/api', (req, res, next) => {
    res.setHeader('Content-Disposition', 'attachment; filename="rest.json"');
    return next();
  });
}
