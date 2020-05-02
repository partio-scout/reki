import _ from 'lodash'

export const defaultOpts: RequestInit = {
  method: 'GET',
  mode: 'same-origin',
  credentials: 'same-origin',
  cache: 'no-store',
  headers: {
    Accept: 'application/json',
  },
}

export function withDefaultOpts(options: RequestInit): RequestInit {
  return {
    ...defaultOpts,
    ...options,
  }
}
