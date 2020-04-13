import React, { useMemo } from 'react';
import _ from 'lodash';
import { Label } from './Label';

export function PropertySelect({ className, currentSelection, label, property, onChange, optionsByProperty }) {
  const value = useMemo(() => currentSelection[property] || '', [currentSelection, property]);
  const options = useMemo(() => _.sortBy(optionsByProperty[property] || []), [optionsByProperty, property]);

  const handleValueChanged = event => {
    const newValue = event.target.value;
    onChange(property, newValue);
  };

  return (
    <Label label={ label }>
      <select className={ className } value={ value } onChange={ handleValueChanged }>
        <option value=""></option>
        { options.map(option => <option value={ option } key={ option }>{ option }</option>) }
      </select>
    </Label>
  );
}
