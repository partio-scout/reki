import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'react-bootstrap';
import { RegistryUserTable } from './RegistryUserTable';

export function getUserManagementPage(registryUserStore, registryUserActions) {
  class UserManagementPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = registryUserStore.getState();
      this.onStoreChanged = this.onStoreChanged.bind(this);
    }

    componentWillMount() {
      registryUserActions.loadRegistryUserList();
    }

    componentDidMount() {
      registryUserStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      registryUserStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      this.setState(state);
    }

    blockUser(userId) {
      registryUserActions.blockUser(userId);
    }

    unblockUser(userId) {
      registryUserActions.unblockUser(userId);
    }

    deleteUser(userId) {
      registryUserActions.deleteRegistryUser(userId);
    }

    render() {
      return (
        <div>
          <div>{ this.props.children }</div>
          <h1>Käyttäjät</h1>
          <LinkContainer to="/admin/newUser">
            <Button bsStyle="primary">Lisää käyttäjä</Button>
          </LinkContainer>
          <RegistryUserTable loggedUser={ this.state.currentUser ? this.state.currentUser.id : 0 } registryUsers={ this.state.registryUsers } onBlock={ this.blockUser } onUnblock={ this.unblockUser }/>
        </div>
      );
    }
  }

  UserManagementPage.propTypes = {
    children: React.PropTypes.node,
  };

  return UserManagementPage;
}
