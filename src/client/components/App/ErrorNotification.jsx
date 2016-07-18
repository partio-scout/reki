import React from 'react';
import { ErrorDialog } from '../../components';

export function getErrorNotification(errorStore, errorActions) {
  class ErrorNotification extends React.Component {
    constructor(props) {
      super(props);
      this.onError = this.onError.bind(this);
      this.state = errorStore.getState();
    }

    componentDidMount() {
      errorStore.listen(this.onError);
    }

    componentWillUnount() {
      errorStore.unlisten(this.onError);
    }

    onError(state) {
      this.setState(state);
    }

    confirmError() {
      errorActions.confirmError();
    }

    render() {
      if (this.state.errors.length === 0) {
        return null;
      }

      const newestError = this.state.errors[this.state.errors.length - 1];
      let message = newestError.message;
      if (newestError.rootCause) {
        message = `${newestError.message} (${newestError.rootCause})`;
      }

      return (
        <ErrorDialog
          title="Ups! Nyt tapahtui virhe..."
          message={ message }
          onHide={ this.confirmError }
        />
      );
    }
  }

  return ErrorNotification;
}
