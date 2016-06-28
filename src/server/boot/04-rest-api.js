export default function mountRestApi(server) {
  
  const restApiRoot = server.get('restApiRoot');
  
  server.use(restApiRoot, function(req, res, next) {
    res.setHeader('Content-Disposition', 'attachment; filename="rest.json"');
    return next();
  });
  
  server.use(restApiRoot, server.loopback.rest());
  
}
