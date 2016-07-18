export function getErrorStore(alt, ErrorActions) {
  class ErrorStore  {
    constructor() {
      this.errors = [ ];

      this.bindListeners({
        handleError: ErrorActions.ERROR,
        confirmError: ErrorActions.CONFIRM_ERROR,
      });
    }

    handleError(err) {
      this.errors.push(err);
    }

    confirmError() {
      this.errors.pop();
    }
  }

  return alt.createStore(ErrorStore, 'ErrorStore');
}
