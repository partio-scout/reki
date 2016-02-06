export function getRestfulResource(request) {
  class RestfulResource {
    constructor(endpoint, accessToken) {
      this.endpoint = endpoint;
      this.accessToken = accessToken ? accessToken.id : null;
    }

    path(basePath, filters) {
      basePath = (basePath !== undefined) ? `/${basePath}` : '';
      filters = (filters !== undefined) ? `&${filters}` : '';
      return `${this.endpoint}${basePath}?access_token=${this.accessToken}${filters}`;
    }

    handleResponse(res) {
      if (res.status >= 400) {
        return Promise.reject({
          message: `REST Error: ${res.req.url} returned HTTP ${res.status}`,
          status: res.status,
        });
      }

      return res && res.hasOwnProperty('body') ? res.body : res;
    }

    findAll(filters) {
      return request.get(this.path('', filters))
        .accept('application/json')
        .then(this.handleResponse);
    }

    findById(id) {
      return request.get(this.path(id))
        .accept('application/json')
        .then(this.handleResponse);
    }

    create(obj) {
      return request.post(this.path(''))
        .accept('application/json')
        .send(obj)
        .then(this.handleResponse);
    }

    update(id, obj) {
      return request.put(this.path(id))
        .accept('application/json')
        .send(obj)
        .then(this.handleRequest);
    }

    del(id) {
      return request.del(this.path(id))
        .accept('application/json')
        .then(this.handleRequest);
    }

    raw(method, path, body) {
      let req = request(method, this.path(path))
        .accept('application/json');

      if (body) {
        req = req.send(body);

        return req.then(this.handleRequest);
      }
    }
  }

  return RestfulResource;
}
