import React from 'react';
import { Button, Modal, Input } from 'react-bootstrap';

export function getSaveSearchButtonContainer(participantActions) {
  function saveSearchFilter(name, filter) {
    participantActions.saveSearchFilter(name, filter);
  }

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
      this.setState({ showModal: false });
    }

    saveAndClose() {
      saveSearchFilter(this.state.searchFilterName, this.props.location.search);
      this.close();
    }

    handleChange(event) {
      this.setState({ searchFilterName: event.target.value });
    }

    saveOnEnter(event) {
      if (event.key === 'Enter') {
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
                placeholder="Italiankieliset leiriläiset"
                value={ this.searchFilterName }
                onChange={ this.handleChange }
                onKeyPress={ this.saveOnEnter }
              />
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="primary" onClick={ this.saveAndClose }>Tallenna</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }

  SaveSearchButtonContainer.propTypes = {
    location: React.PropTypes.object.isRequired,
  };

  return SaveSearchButtonContainer;
}
