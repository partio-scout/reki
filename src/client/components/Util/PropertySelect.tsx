import React, { useMemo } from 'react';
import _ from 'lodash';
import { Label } from './Label';
import { FilterSelection, OptionsByProperty } from '../../model';

type PropertySelectProps = Readonly<{
  className?: string;
  currentSelection: FilterSelection;
  label: string;
  property: string;
  onChange: (property: string, newValue: unknown) => void;
  optionsByProperty: OptionsByProperty;
}>

export const PropertySelect: React.FC<PropertySelectProps> = ({ className, currentSelection, label, property, onChange, optionsByProperty }) => {
  const value = currentSelection[property] || '';
  const options = useMemo(() => _.sortBy(optionsByProperty[property] || []), [optionsByProperty, property]);

  const handleValueChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    onChange(property, newValue);
  };

  return (
    <Label label={ label }>
      <select className={ className } value={ value as string } onChange={ handleValueChanged }>
        <option value=""></option>
        { options.map(option => <option value={ option } key={ option }>{ option }</option>) }
      </select>
    </Label>
  );
};
