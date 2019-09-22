import React from 'react';
import { ErrorDialog } from '..';
import { useErrorContext } from '../../errors';

export function ErrorNotification(props) {
  const { errors, confirmLatest } = useErrorContext();

  if (errors.length === 0) {
    return null;
  }

  const newestError = errors[errors.length - 1];
  const message = [
    newestError.message,
    newestError.rootCause,
  ].filter(Boolean).join(' ');

  return (
    <ErrorDialog
      title="Ups! Nyt tapahtui virhe..."
      message={ message }
      onHide={ () => { confirmLatest(); } }
    />
  );
}
