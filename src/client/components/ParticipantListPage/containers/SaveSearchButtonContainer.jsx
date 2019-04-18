import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Input } from 'react-bootstrap';
import * as actions from '../../../actions';

export function getSaveSearchButtonContainer() {
  class SaveSearchButtonContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showModal: false,
        searchFilterName: '',
      };
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.saveAndClose = this.saveAndClose.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.saveOnEnter = this.saveOnEnter.bind(this);
    }

    open() {
      this.setState({ showModal: true });
    }

    close() {
      this.setState({ showModal: false, searchFilterName: '' });
    }

    saveAndClose() {
      this.props.saveSearchFilter(this.state.searchFilterName);
      this.close();
    }

    handleChange(event) {
      this.setState({ searchFilterName: event.target.value });
    }

    saveOnEnter(event) {
      if (event.key === 'Enter' && this.state.searchFilterName) {
        this.saveAndClose();
      }
    }

    render() {
      return (
        <div>
          <Button className="sm-position-right-top pull-right" bsStyle="primary" onClick={ this.open }>
            Tallenna haku
          </Button>
          <Modal show={ this.state.showModal } onHide={ this.close }>
            <Modal.Header closeButton>
              <Modal.Title>Anna hakuehdoille nimi</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Input
                type="text"
                autoFocus={ true }
                placeholder="Hakuehdon nimi"
                value={ this.searchFilterName }
                onChange={ this.handleChange }
                onKeyPress={ this.saveOnEnter }
              />
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="primary" disabled={ this.state.searchFilterName === '' } onClick={ this.saveAndClose }>Tallenna</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }

  const mapDispatchToProps = {
    saveSearchFilter: actions.saveSearchFilter,
  };

  return connect(null, mapDispatchToProps)(SaveSearchButtonContainer);
}
