import React from 'react';

export class PropertyTextArea extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.onChange(this.props.property, event);
  }

  render() {
    return (
      <textarea
        value={ this.props.value || '' }
        onChange={ this.onChange }
        rows={ this.props.rows }
      />
    );
  }
}
