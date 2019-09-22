import React from 'react';

export class ErrorDialog extends React.Component {
  render() {
    return (
      <div className="error-dialog">
        <h2>{ this.props.title }</h2>
        <div>{ this.props.message }</div>
        <button onClick={ this.props.onHide }>OK</button>
      </div>
    );
  }
}
