import React from 'react';
import { getRegistryUserTable } from './RegistryUserTable';

const RegistryUserTable = getRegistryUserTable();

export function getUserManagementPage(participantStore, participantActions) {
  class UserManagementPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = participantStore.getState();
    }

    componentWillMount() {
      participantActions.loadRegistryUserList();
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnMount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
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
