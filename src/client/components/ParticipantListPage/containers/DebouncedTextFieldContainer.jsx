import React from 'react';
import { getDebouncedTextField } from '../../../components';

export function getDebouncedTextFieldContainer() {
  const DebouncedTextField = getDebouncedTextField();

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
