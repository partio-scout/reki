import React from 'react';
import { RegistryUserTable } from './RegistryUserTable';

export function getUserManagementPage(registryUserStore, registryUserActions) {
  class UserManagementPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = registryUserStore.getState();
    }

    componentWillMount() {
      registryUserActions.loadRegistryUserList();
    }

    componentDidMount() {
      registryUserStore.listen(this.onregistryUserStoreChange.bind(this));
    }

    componentWillUnMount() {
      registryUserStore.unlisten(this.onregistryUserStoreChange.bind(this));
    }

    onregistryUserStoreChange(state) {
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
