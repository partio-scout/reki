import React from 'react';
import { RegistryUserTable } from './RegistryUserTable';
import { Grid, Row } from 'react-bootstrap';

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
        <Grid>
          <Row>
            <h1>Käyttäjät</h1>
          </Row>
          <Row>
            <RegistryUserTable registryUsers={ this.state.registryUsers }/>
          </Row>
        </Grid>
      );
    }
  }

  return UserManagementPage;
}
