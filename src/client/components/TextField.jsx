import React from 'react';
import { Input } from 'react-bootstrap';

export function getTextField() {
  function TextField({ value, label, property, onChange }) {
    function handleValueChanged(event) {
      const newValue = event.target.value;
      onChange(property, newValue);
    }

    return (
      // <div>
        <Input type="text" label={ label } value={ value } onChange={ handleValueChanged }></Input>
        // <button type="submit">Submit</button>
      // </div>
    );
  }

  TextField.propTypes = {
    value: React.PropTypes.any,
    label: React.PropTypes.string.isRequired,
    property: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return TextField;
}
