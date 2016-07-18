import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export class ErrorDialog extends React.Component {
  render() {
    return (
      <Modal show="true" onHide={ this.props.onHide }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { this.props.message }
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center">
            <Button bsStyle="primary" onClick={ this.props.onHide }>Ok</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

ErrorDialog.propTypes = {
  onHide: React.PropTypes.func.isRequired,
  title: React.PropTypes.string.isRequired,
  message: React.PropTypes.string.isRequired,
};
