import React from 'react';
import _ from 'lodash';
import { Input } from 'react-bootstrap';

export function getDebouncedTextField() {
  class DebouncedTextField extends React.Component {
    constructor(props) {
      super(props);
      this.delayedOnChange = _.debounce(
        value => this.props.onChange(this.props.property, value), 1500);
      this.handleValueChanged = this.handleValueChanged.bind(this);
      this.handleFieldBlur = this.handleFieldBlur.bind(this);
      this.disableEnter = this.disableEnter.bind(this);
      this.state = { textSearch: props.value };
    }

    componentWillReceiveProps(nextProps) {
      this.setState({ textSearch: nextProps.value });
    }

    handleValueChanged(event) {
      event.persist();
      this.setState({ textSearch: event.target.value });
      this.delayedOnChange(event.target.value);
    }

    handleFieldBlur(event) {
      event.persist();
      this.delayedOnChange.flush(event.target.value);
    }

    disableEnter(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.persist();
        this.delayedOnChange.flush(event.target.value);
        return false;
      }
    }

    render() {
      return (
        <div>
          <Input type="text" label={ this.props.label } value={ this.state.textSearch } onChange={ this.handleValueChanged } onBlur={ this.handleFieldBlur } onKeyPress={ this.disableEnter } />
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
