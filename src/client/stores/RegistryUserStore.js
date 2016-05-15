export function getRegistryUserStore(alt, RegistryUserActions) {
  class RegistryUserStore  {
    constructor() {
      this.registryUsers = [ ];
      this.currentUser = null;

      this.bindListeners({
        handleRegistryUserListUpdated: RegistryUserActions.REGISTRY_USER_LIST_UPDATED,
        handleCurrentUserUpdated: RegistryUserActions.CURRENT_USER_UPDATED,
      });
    }

    handleRegistryUserListUpdated(registryUsers) {
      this.registryUsers = registryUsers;
    }

    handleCurrentUserUpdated(newCurrentUser) {
      this.currentUser = newCurrentUser;
    }
  }

  return alt.createStore(RegistryUserStore, 'RegistryUserStore');
}
