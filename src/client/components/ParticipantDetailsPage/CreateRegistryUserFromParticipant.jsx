import React from 'react';
import _ from 'lodash';
import crypto from 'crypto';
import { browserHistory } from 'react-router';
import { RegistryUserForm } from '../Util/RegistryUserForm';

import * as validateRegistryUser from '../../validation/registryUser';

export function getCreateRegistryUserFromParticipant(registryUserActions, registryUserStore, participantStore) {
  class CreateRegistryUserFromParticipant extends React.Component {
    constructor(props) {
      super(props);
      const state = {};
      const participantStoreState = participantStore.getState();
      state.registryUser = {
        firstName: participantStoreState.participantDetails.firstName,
        lastName: participantStoreState.participantDetails.lastName,
        memberNumber:participantStoreState.participantDetails.memberNumber,
        phoneNumber: participantStoreState.participantDetails.phoneNumber,
        email: participantStoreState.participantDetails.email,
        roles: [],
      };
      state.roles = registryUserStore.roles;
      state.validationErrors = [];
      this.state = state;

      this.onRegistryUserStoreChanged = this.onRegistryUserStoreChanged.bind(this);
      this.onPropertyChange = this.onPropertyChange.bind(this);
      this.onRoleChange = this.onRoleChange.bind(this);
      this.onCancel = this.onCancel.bind(this);
      this.onSave = this.onSave.bind(this);
    }

    componentWillMount() {
      registryUserActions.loadRoleNames();
    }

    componentDidMount() {
      registryUserStore.listen(this.onRegistryUserStoreChanged);
    }

    componentWillUnmount() {
      registryUserStore.unlisten(this.onRegistryUserStoreChanged);
    }

    onRegistryUserStoreChanged(state) {
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
      registryUser.password = crypto.randomBytes(24).toString('hex');

      const validationErrors = validateRegistryUser.default(registryUser);
      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        registryUserActions.createRegistryUser(registryUser);
        browserHistory.goBack();
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

  CreateRegistryUserFromParticipant.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return CreateRegistryUserFromParticipant;
}
