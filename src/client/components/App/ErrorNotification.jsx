import React from 'react';
import { connect } from 'react-redux';
import { ErrorDialog } from '../../components';
import * as actions from '../../actions';
import { createStateMapper } from '../../redux-helpers';

export function getErrorNotification() {
  const ErrorNotification = ({ errors, confirmError }) => {
    if (errors.length === 0) {
      return null;
    }

    const newestError = errors[errors.length - 1];
    let message = newestError.message;
    if (newestError.rootCause) {
      message = `${newestError.message} (${newestError.rootCause})`;
    }

    return (
      <ErrorDialog
        title="Ups! Nyt tapahtui virhe..."
        message={ message }
        onHide={ confirmError }
      />
    );
  };

  const mapStateToProps = createStateMapper({
    errors: state => state.errors.errors,
  });

  const mapDispatchToProps = {
    confirmError: actions.confirmError,
  };

  return connect(mapStateToProps, mapDispatchToProps)(ErrorNotification);
}
