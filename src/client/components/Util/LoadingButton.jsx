import React from 'react';
import { Button } from 'react-bootstrap';

export class LoadingButton extends React.Component {
  render() {
    return (
      <Button
        type="submit"
        disabled={ this.props.loading }
        bsStyle={ this.props.bsStyle }>
        { this.props.loading ? this.props.labelWhileLoading : this.props.label }
      </Button>
    );
  }
}

LoadingButton.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  label: React.PropTypes.string.isRequired,
  labelWhileLoading: React.PropTypes.string.isRequired,
  bsStyle: React.PropTypes.string,
};
