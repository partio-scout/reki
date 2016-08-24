import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export function getDeleteRegistryUser(registryUserActions, registryUserStore) {
  class DeleteRegistryUser extends React.Component {
    constructor(props) {
      super(props);
      const state = {};
      state.registryUser = {
        firstName: '',
        lastName: '',
        memberNumber: '',
        phoneNumber: '',
        email: '',
        roles: [],
      };
      this.state = state;

      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.onDelete = this.onDelete.bind(this);
    }

    componentWillMount() {
      registryUserActions.loadRegistryUserById(this.props.params.id);
    }

    componentDidMount() {
      registryUserStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      registryUserStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      if (state.registryUserById) {
        this.setState({ registryUser: state.registryUserById });
      }
    }

    onCancel() {
      browserHistory.goBack();
    }

    onDelete() {
      registryUserActions.deleteRegistryUser(this.props.params.id);
      browserHistory.goBack();
    }

    render() {
      return (
        <Modal show={ true } onHide={ this.onCancel }>
          <Modal.Header closeButton>
            <Modal.Title>Käyttäjän poistaminen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { `Haluatko varmasti poistaa käyttäjän ${this.state.registryUser.firstName} ${this.state.registryUser.lastName} (${this.state.registryUser.memberNumber})?` }
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={ this.onCancel }>Peruuta</Button>
            <Button bsStyle="primary" onClick={ this.onDelete }>Poista</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  }

  DeleteRegistryUser.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return DeleteRegistryUser;
}
