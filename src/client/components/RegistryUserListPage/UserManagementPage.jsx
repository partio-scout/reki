import React from 'react';
import { connect } from 'react-redux';
import { RegistryUserTable } from './RegistryUserTable';
import * as actions from '../../actions';
import { createStateMapper } from '../../redux-helpers';

export function getUserManagementPage() {
  class UserManagementPage extends React.Component {
    componentDidMount() {
      this.props.loadRegistryUserList();
    }

    render() {
      const { registryUsers, blockUser, unblockUser } = this.props;
      return (
        <div>
          <h1>Käyttäjät</h1>
          <RegistryUserTable registryUsers={ registryUsers } onBlock={ userId => blockUser({ userId }) } onUnblock={ userId => unblockUser({ userId }) } />
        </div>
      );
    }
  }

  const mapStateToProps = createStateMapper({
    registryUsers: state => state.registryUsers.registryUsers,
  });
  const mapDispatchToProps = {
    blockUser: actions.blockUser,
    unblockUser: actions.unblockUser,
    loadRegistryUserList: actions.loadRegistryUserList,
  };

  return connect(mapStateToProps, mapDispatchToProps)(UserManagementPage);
}
