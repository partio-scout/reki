import React from 'react';
import { Button, Modal, Input } from 'react-bootstrap';

export function getSaveSearchButtonContainer(participantActions) {
  class SaveSearchButtonContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showModal: false,
        searchFilterName: '',
      };
      this.open = this.open.bind(this);
      this.save = this.save.bind(this);
      this.close = this.close.bind(this);
      this.saveAndClose = this.saveAndClose.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    open() {
      this.setState({ showModal: true });
    }

    save() {
      participantActions.saveSearchFilter(this.state.searchFilterName, this.props.location.search);
    }

    close() {
      this.setState({ showModal: false });
    }

    saveAndClose() {
      this.save();
      this.close();
    }

    handleChange(event) {
      this.setState({ searchFilterName: event.target.value });
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
