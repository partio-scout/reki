import React, { useState } from 'react';
import { PropertySelect } from '../..';
import { Label } from '../../Util/Label';
import { FilterSelection, OptionsByProperty } from '../../../model';

type GenericPropertyFilterContainerProps = Readonly<{
  label: string;
  onChange: (property: string, value: unknown) => void;
  properties: readonly { property: string; label: string }[];
  currentSelection: FilterSelection;
  optionsByProperty: OptionsByProperty;
}>

export const GenericPropertyFilterContainer: React.FC<GenericPropertyFilterContainerProps> = ({ label, onChange, properties, currentSelection, optionsByProperty }) => {
  const [property, setProperty] = useState('');

  const handlePropertyChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(property, '');
    setProperty(event.target.value);
  };

  return (
    <div className="generic-property-filter__row">
      <Label label={ label }>
        <select value={ property } onChange={ handlePropertyChanged }>
          <option value=""></option>
          { properties.map(({ property, label }, index) => <option value={ property } key={ index }>{ label }</option>) }
        </select>
      </Label>
        <PropertySelect
          onChange={ onChange }
          currentSelection={ currentSelection }
          label=""
          property={ property }
          optionsByProperty={ optionsByProperty }
        />
    </div>
  );
};
