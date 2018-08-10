export function getRestfulResource(request) {
  class RestfulResource {
    constructor(endpoint) {
      this.endpoint = endpoint;
    }

    path(basePath, filters) {
      basePath = (basePath !== undefined) ? `/${basePath}` : '';
      filters = (filters !== undefined) ? `?${filters}` : '';
      return `${this.endpoint}${basePath}${filters}`;
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

    findById(id, filters) {
      return request.get(this.path(id, filters))
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
        .then(this.handleResponse);
    }

    del(id) {
      return request.del(this.path(id))
        .accept('application/json')
        .then(this.handleResponse);
    }

    raw(method, path, options) {
      const {
        body,
        filters,
      } = options || {};
      let req = request(method, this.path(path, filters))
        .accept('application/json');

      if (body) {
        req = req.send(body);
      }

      return req.then(this.handleResponse);
    }
  }

  return RestfulResource;
}
