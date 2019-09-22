import React from 'react';

export class LoadingButton extends React.Component {
  render() {
    return (
      <button
        onClick={ this.props.onClick ? this.props.onClick : null }
        disabled={ this.props.disabled === true || this.props.loading }>
        { this.props.loading ? this.props.labelWhileLoading : this.props.label }
      </button>
    );
  }
}
