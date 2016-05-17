import React from 'react';
import { getTextSearch } from '../../../components';

export function getTextSearchContainer() {
  const TextSearch = getTextSearch();

  function TextSearchContainer({ onChange, currentTextValue }) {
    return (
      <TextSearch
        label="Tekstihaku"
        property="textSearch"
        value={ currentTextValue }
        onChange={ onChange }
      />
    );
  }

  return TextSearchContainer;
}
