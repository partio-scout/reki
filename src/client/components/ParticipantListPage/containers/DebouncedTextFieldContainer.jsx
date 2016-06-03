import React from 'react';
import { getDebouncedTextField } from '../../../components';

export function getDebouncedTextFieldContainer(participantActions) {
  const DebouncedTextField = getDebouncedTextField(participantActions);

  function debouncedTextFieldContainer({ onChange, currentTextValue, location }) {
    return (
      <DebouncedTextField
        label="Tekstihaku"
        property="textSearch"
        value={ currentTextValue }
        onChange={ onChange }
        location= { location }
      />
    );
  }

  return debouncedTextFieldContainer;
}
