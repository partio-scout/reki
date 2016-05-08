export function getRegistryUserActions(alt, registryUserResource) {
  class RegistryUserActions {
    loadRegistryUserList() {
      return dispatch => {
        dispatch();
        registryUserResource.findAll()
          .then(registryUserList => this.registryUserListUpdated(registryUserList),
                err => this.registryUserListUpdatedFailed(err));
      };
    }

    registryUserListUpdated(registryUsers) {
      return registryUsers;
    }

    registryUserListUpdatedFailed(error) {
      return error;
    }
  }

  return alt.createActions(RegistryUserActions);
}
