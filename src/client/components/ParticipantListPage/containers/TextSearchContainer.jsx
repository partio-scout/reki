import React from 'react';
import { getTextField } from '../../../components';

export function getTextSearchContainer() {
  const TextField = getTextField();

  function TextSearchContainer({ onChange, currentTextValue }) {
    return (
      <TextField
        label="Tekstihaku"
        property="textSearch"
        value={ currentTextValue }
        onChange={ onChange }
      />
    );
  }

  return TextSearchContainer;
}
