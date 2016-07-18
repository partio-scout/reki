import React from 'react';
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

    render() {
      return (
        <div>
          <h1>Käyttäjät</h1>
          <RegistryUserTable registryUsers={ this.state.registryUsers } onBlock={ this.blockUser } onUnblock={ this.unblockUser } />
        </div>
      );
    }
  }

  return UserManagementPage;
}
