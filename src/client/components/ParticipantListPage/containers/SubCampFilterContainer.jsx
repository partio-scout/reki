import React from 'react';
import { getPropertySelect } from '../../../components';

const options = [
  '',
  'humina',
  'hurma',
  'polte',
  'raiku',
  'riehu',
  'syke',
  'unity',
];

export function getSubCampFilterContainer(participantStore, participantActions) {
  const PropertySelect = getPropertySelect();

  function SubCampFilterContainer({ onChange, currentSelection }) {
    return (
      <PropertySelect
        label="Alaleiri"
        property="subCamp"
        value={ currentSelection.subCamp }
        onChange={ onChange }
        options={ options }
      />
    );
  }

  return SubCampFilterContainer;
}

