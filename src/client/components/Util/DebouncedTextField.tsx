import React, { useState, useEffect, useMemo, useCallback } from 'react';
import _ from 'lodash';
import { Label } from './Label';
import { FilterSelection } from '../../model';

type DebouncedTextFieldProps = Readonly<{
  label: string;
  property: string;
  onChange: (property: string, newValue: string) => void;
  currentSelection: FilterSelection;
}>

export const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({ label, currentSelection, onChange, property }) => {
  const value = currentSelection[property];
  const [currentValue, setCurrentValue] = useState(value || '');
  const delayedOnChange = useMemo(() => _.debounce((newValue: string) => onChange(property, newValue), 1500), [property, onChange]);

  const resetValue = useCallback((newValue = '') => {
    delayedOnChange.cancel();
    setCurrentValue(newValue);
  }, [delayedOnChange]);
  const flushValue = () => delayedOnChange.flush();

  useEffect(() => {
    resetValue(value);
  }, [value, resetValue]);

  const handleValueChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setCurrentValue(value);
    delayedOnChange(value);
  };

  const handleSpecialKeys = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      flushValue();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      resetValue(value);
    }
  };

  return (
    <Label label={ label }>
      <input
        type="text"
        value={ currentValue as string }
        onChange={ handleValueChanged }
        onBlur={ flushValue }
        onKeyDown={ handleSpecialKeys }
      />
    </Label>
  );
};
