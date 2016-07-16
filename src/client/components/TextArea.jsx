import React from 'react';

export class TextArea extends React.Component {
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
        className="form-control"
        rows={ this.props.rows }
      />
    );
  }
}

TextArea.propTypes = {
  property: React.PropTypes.string,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  rows: React.PropTypes.number,
};
