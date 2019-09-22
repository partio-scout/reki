import React, { useState, useEffect, useMemo, useCallback } from 'react';
import _ from 'lodash';
import { Label } from './Label';

export const DebouncedTextField = ({ label, currentSelection, onChange, property }) => {
  const value = currentSelection[property];
  const [currentValue, setCurrentValue] = useState(value || '');
  const delayedOnChange = useMemo(() => _.debounce(newValue => onChange(property, newValue), 1500), [property, onChange]);

  const resetValue = useCallback((newValue = '') => {
    delayedOnChange.cancel();
    setCurrentValue(newValue);
  }, [delayedOnChange]);

  useEffect(() => {
    resetValue(value);
  }, [value, resetValue]);

  const handleValueChanged = event => {
    const value = event.target.value;
    setCurrentValue(value);
    delayedOnChange(value);
  };

  const handleSpecialKeys = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      delayedOnChange.flush();
      return false;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      resetValue(value);
      return false;
    }
  };

  return (
    <Label label={ label }>
      <input
        type="text"
        value={ currentValue }
        onChange={ event => handleValueChanged(event) }
        onBlur={ event => delayedOnChange.flush() }
        onKeyDown={ event => handleSpecialKeys(event) }
      />
    </Label>
  );
};
