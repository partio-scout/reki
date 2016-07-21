import React from 'react';
import { Input } from 'react-bootstrap';

export function getPropertySelect() {
  function PropertySelect({ className, value, label, property, options, onChange }) {
    function handleValueChanged(event) {
      const newValue = event.target.value;
      onChange(property, newValue);
    }

    return (
      <Input type="select" className={ className } label={ label } value={ value } onChange={ handleValueChanged }>
        { options.map(option => <option value={ option } key={ option }>{ option }</option>) }
      </Input>
    );
  }

  PropertySelect.propTypes = {
    className: React.PropTypes.string,
    value: React.PropTypes.any,
    label: React.PropTypes.string.isRequired,
    property: React.PropTypes.string.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return PropertySelect;
}
