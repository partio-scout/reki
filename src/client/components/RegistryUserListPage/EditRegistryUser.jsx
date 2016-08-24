import React from 'react';
import _ from 'lodash';
import { browserHistory } from 'react-router';
import { RegistryUserForm } from './RegistryUserForm';

import * as validateRegistryUser from '../../validation/registryUser';

export function getEditRegistryUser(registryUserActions, registryUserStore) {
  class EditRegistryUser extends React.Component {
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
      state.roles = registryUserStore.roles;
      state.showModal = true;
      state.validationErrors = [];
      this.state = state;

      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.onPropertyChange = this.onPropertyChange.bind(this);
      this.onRoleChange = this.onRoleChange.bind(this);
      this.onCancel = this.onCancel.bind(this);
      this.onSave = this.onSave.bind(this);
    }

    componentWillMount() {
      registryUserActions.loadRegistryUserById(this.props.params.id);
      registryUserActions.loadRoleNames();
    }

    componentDidMount() {
      registryUserStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      registryUserStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      if (state && state.roles) {
        this.setState({ roles: state.roles.roles });
      }
      if (state.registryUserById) {
        this.setState({ registryUser: state.registryUserById });
      }
    }

    onPropertyChange(property, value) {
      const registryUser = this.state.registryUser;
      registryUser[property] = value;
      this.setState({ registryUser: registryUser });
    }

    onRoleChange(roleName, value) {
      const registryUser = this.state.registryUser;
      if (value) {
        registryUser.roles.push(roleName);
      } else { // remove role from array
        const i = _.indexOf(registryUser.roles, roleName);
        if (i > -1) {
          registryUser.roles.splice(i, 1);
        }
      }
      this.setState({ registryUser: registryUser });
    }

    onCancel() {
      browserHistory.goBack();
    }

    onSave(user) {
      const registryUser = this.state.registryUser;

      const validationErrors = validateRegistryUser.default(registryUser);
      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        registryUserActions.updateRegistryUser(registryUser);
        browserHistory.goBack();
      }
    }

    render() {
      return (
        <RegistryUserForm
          title="Muokkaa käyttäjää"
          registryUser={ this.state.registryUser }
          roles={ this.state.roles }
          onPropertyChange={ this.onPropertyChange }
          onRoleChange={ this.onRoleChange }
          onCancel={ this.onCancel }
          onSave={ this.onSave }
          validationErrors={ this.state.validationErrors }
        />
      );
    }
  }

  EditRegistryUser.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return EditRegistryUser;
}
