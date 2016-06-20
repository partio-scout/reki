export function getRegistryUserStore(alt, RegistryUserActions) {
  class RegistryUserStore  {
    constructor() {
      this.registryUsers = [ ];
      this.currentUser = null;
      this.loggedIn = false;

      this.bindListeners({
        handleRegistryUserListUpdated: RegistryUserActions.REGISTRY_USER_LIST_UPDATED,
        handleCurrentUserUpdated: RegistryUserActions.CURRENT_USER_UPDATED,
        handleLoginStatusUpdated: RegistryUserActions.UPDATE_LOGIN_STATUS,
      });
    }

    handleRegistryUserListUpdated(registryUsers) {
      this.registryUsers = registryUsers;
    }

    handleCurrentUserUpdated(newCurrentUser) {
      this.currentUser = newCurrentUser;
    }

    handleLoginStatusUpdated(loggedIn) {
      this.loggedIn = loggedIn;
    }
  }

  return alt.createStore(RegistryUserStore, 'RegistryUserStore');
}
