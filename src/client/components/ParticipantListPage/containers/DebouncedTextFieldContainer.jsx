import React from 'react';
import { getDebouncedTextField } from '../../../components';

export function getDebouncedTextFieldContainer() {
  const DebouncedTextField = getDebouncedTextField();

  function debouncedTextFieldContainer({ onChange, currentSelection, property }) {
    return (
      <DebouncedTextField
        label="Tekstihaku"
        property={ property }
        value={ currentSelection[property] }
        onChange={ onChange }
      />
    );
  }

  return debouncedTextFieldContainer;
}
