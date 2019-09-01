import _ from 'lodash';

export const defaultOpts = {
  method: 'GET',
  mode: 'same-origin',
  credentials: 'same-origin',
  cache: 'no-store',
  headers: {
    'Accept': 'application/json',
  },
};

export function withDefaultOpts(options) {
  return _.merge({}, defaultOpts, options);
}
