export default function mountRestApi(server) {
  const restApiRoot = server.get('restApiRoot');
  server.use(restApiRoot, server.loopback.rest());
}
