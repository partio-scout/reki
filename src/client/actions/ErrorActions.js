export function getErrorActions(alt) {
  function getRootCause(error) {
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
  }

  return alt.createActions(ErrorActions);
}
