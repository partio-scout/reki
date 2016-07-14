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

    componentWillUnMount() {
      registryUserStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      this.setState(state);
    }

    render() {
      return (
        <div>
          <h1>Käyttäjät</h1>
          <RegistryUserTable registryUsers={ this.state.registryUsers }/>
        </div>
      );
    }
  }

  return UserManagementPage;
}
