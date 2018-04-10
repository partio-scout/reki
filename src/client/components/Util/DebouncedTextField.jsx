import React from 'react';
import _ from 'lodash';
import { Input } from 'react-bootstrap';

export function getDebouncedTextField() {
  class DebouncedTextField extends React.Component {
    constructor(props) {
      super(props);
      const callOnChange = value => this.props.onChange(this.props.property, value);
      this.delayedOnChange = _.debounce(callOnChange, 1500);
      this.state = { textSearch: props.value };
    }

    componentWillReceiveProps(nextProps) {
      this.setState({ textSearch: nextProps.value });
    }

    handleValueChanged(event) {
      const value = event.target.value;
      this.setState({ textSearch: value });
      this.delayedOnChange(value);
    }

    disableEnter(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.delayedOnChange.flush();
        return false;
      }
    }

    render() {
      return (
        <div>
          <Input
            type="text"
            label={ this.props.label }
            value={ this.state.textSearch }
            onChange={ event => this.handleValueChanged(event) }
            onBlur={ event => this.delayedOnChange.flush() }
            onKeyPress={ event => this.handleEnter(event) }
          />
        </div>
      );
    }
  }

  DebouncedTextField.propTypes = {
    value: React.PropTypes.any,
    label: React.PropTypes.string.isRequired,
    property: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return DebouncedTextField;
}
