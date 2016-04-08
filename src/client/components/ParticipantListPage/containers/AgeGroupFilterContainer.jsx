import React from 'react';
import { getPropertySelect } from '../../../components';

const options = [
  '',
  'perheleiriläinen',
  'tarpoja',
  'samoaja',
  'vaeltaja',
  'aikuinen',
];

export function getAgeGroupFilterContainer() {
  const PropertySelect = getPropertySelect();

  function AgeGroupFilterContainer({ onChange, currentSelection }) {
    return (
      <PropertySelect
        label="Ikäkausi"
        property="ageGroup"
        value={ currentSelection.ageGroup }
        onChange={ onChange }
        options={ options }
      />
    );
  }

  return AgeGroupFilterContainer;
}
