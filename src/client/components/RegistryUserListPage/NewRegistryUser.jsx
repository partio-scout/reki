import React from 'react';
import crypto from 'crypto';
import _ from 'lodash';
import { RegistryUserForm } from './RegistryUserForm';

import * as validateRegistryUser from '../../validation/registryUser';

export function getNewRegistryUser(registryUserActions, registryUserStore) {
  class NewRegistryUser extends React.Component {
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
      registryUserActions.getRoleNames();
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
      } else {
        const i = _.indexOf(registryUser.roles, roleName);
        if (i > -1) {
          registryUser.roles.splice(i, 1);
        }
      }
      this.setState({ registryUser: registryUser });
    }

    onCancel() {
      this.setState({ showModal: false });
    }

    onSave(user) {
      const registryUser = this.state.registryUser;
      registryUser.password = crypto.randomBytes(24).toString('hex');

      const validationErrors = validateRegistryUser.default(registryUser);
      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        registryUserActions.createRegistryUser(registryUser);
        this.setState({ showModal: false }); // Close window
      }
    }

    render() {
      return (
        <RegistryUserForm
          title="Luo käyttäjä"
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

  return NewRegistryUser;
}
