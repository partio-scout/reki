import { defaultOpts, withDefaultOpts } from '../fetch';

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
      return fetch(getPath('', filters), defaultOpts)
      .then(handleResponse);
    }

    function findById(id, filters) {
      return fetch(getPath(id, filters), defaultOpts)
      .then(handleResponse);
    }

    function create(obj) {
      return fetch(getPath(''), withDefaultOpts({ method: 'POST', body: obj, headers: { 'Content-Type': 'application/json' } }))
      .then(handleResponse);
    }

    function update(id, obj) {
      return fetch(getPath(id), withDefaultOpts({ method: 'PUT', body: obj, headers: { 'Content-Type': 'application/json' } }))
      .then(handleResponse);
    }

    function del(id) {
      return fetch(getPath(id), withDefaultOpts({ method: 'DELETE' }))
      .then(handleResponse);
    }

    function raw(method, path, options) {
      const {
        body,
        filters,
      } = options || {};

      return fetch(getPath(path, filters), withDefaultOpts({ method, body, headers: body !== undefined ? { 'Content-Type': 'application/json' } : {} }))
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
