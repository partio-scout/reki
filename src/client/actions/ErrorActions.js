import { defaultOpts } from '../fetch';

export function getErrorActions(alt) {
  function getRootCause(error) {
    if (!error) {
      return null;
    }
    if (error.status === 401) {
      return 'Ei käyttöoikeutta';
    } else if (error.status === 503) {
      return 'Järjestelmää huolletaan';
    }
    return null;
  }

  class ErrorActions {
    error(error, message) {
      return {
        error: error,
        message: message || error.message,
        rootCause: getRootCause(error),
      };
    }

    confirmError() {
      return true;
    }

    loadFlashes() {
      return dispatch => {
        dispatch();

        return fetch('/flashes', defaultOpts)
        .then(response => {
          if (response.ok) {
            return response.json().then(body => {
              for (const error of (body.error || [])) {
                this.error(null, error);
              }
            });
          }
        });
      };
    }
  }

  return alt.createActions(ErrorActions);
}
