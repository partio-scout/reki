import React from 'react';
import _ from 'lodash';
import { Input } from 'react-bootstrap';

export function getDebouncedTextField() {
  function debouncedTextField({ value, label, property, onChange }) {

    const delayedOnChange = _.debounce(value => onChange(property, value), 300);

    function handleValueChanged(event) {
      event.persist();
      delayedOnChange(event.target.value);
    }

    function handleFieldBlur(event) {
      event.persist();
      delayedOnChange.flush(event.target.value);
    }

    function disableEnter(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.persist();
        delayedOnChange.flush(event.target.value);
        return false;
      }
    }

    return (
        <div className="textsearch">
          <Input type="text" label={ label } value={ value } onChange={ handleValueChanged } onBlur={ handleFieldBlur } onKeyPress={ disableEnter } />
        </div>
    );
  }

  debouncedTextField.propTypes = {
    value: React.PropTypes.any,
    label: React.PropTypes.string.isRequired,
    property: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return debouncedTextField;
}
