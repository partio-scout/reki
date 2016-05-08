export function getRegistryUserStore(alt, RegistryUserActions) {
  class RegistryUserStore  {
    constructor() {
      this.registryUsers = [ ];

      this.bindListeners({
        handleRegistryUserListUpdated: RegistryUserActions.REGISTRY_USER_LIST_UPDATED,
      });
    }

    handleRegistryUserListUpdated(registryUsers) {
      this.registryUsers = registryUsers;
    }
  }

  return alt.createStore(RegistryUserStore, 'RegistryUserStore');
}
