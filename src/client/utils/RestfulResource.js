import { withDefaultOpts } from '../fetch';

export function getRestfulResource() {
  function RestfulResource(endpoint) {
    function getPath(basePath, filters) {
      basePath = (basePath !== undefined) ? `/${basePath}` : '';
      filters = (filters !== undefined) ? `?${filters}` : '';
      return `${endpoint}${basePath}${filters}`;
    }

    function handleResponse(res) {
      if (!res.ok) {
        return Promise.reject({
          message: `REST Error: ${res.url} returned HTTP ${res.status} (${res.statusText})`,
          status: res.status,
        });
      }

      return res.json();
    }

    function findAll(filters) {
      return raw('GET', '', { filters });
    }

    function findById(id, filters) {
      return raw('GET', id, { filters });
    }

    function create(obj) {
      return raw('POST', '', { body: obj });
    }

    function update(id, obj) {
      return raw('PUT', id, { body: obj });
    }

    function del(id) {
      return raw('DELETE', id);
    }

    function raw(method, path, { body, filters } = {}) {
      return fetch(getPath(path, filters), withDefaultOpts({ method, body: JSON.stringify(body), headers: body !== undefined ? { 'Content-Type': 'application/json' } : {} }))
      .then(handleResponse);
    }

    return {
      findAll,
      findById,
      create,
      update,
      del,
      raw,
    };
  }

  return RestfulResource;
}
