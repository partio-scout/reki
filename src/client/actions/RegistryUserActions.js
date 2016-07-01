import Cookie from 'js-cookie';

function deleteAccessTokenCookie() {
  Cookie.remove('accessToken');
}

export function getRegistryUserActions(alt, registryUserResource) {
  class RegistryUserActions {
    resetAllData() {
      return null;
    }

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

    updateLoginStatus(loggedIn) {
      return loggedIn;
    }

    loadCurrentUser(id) {
      return dispatch => {
        dispatch();
        if (!id) {
          this.currentUserUpdated(null);
        } else {
          registryUserResource.findById(id)
            .then(newCurrentUser => this.currentUserUpdated(newCurrentUser),
                  error => this.currentUserUpdateFailed(error));
        }
      };
    }

    currentUserUpdated(newCurrentUser) {
      return newCurrentUser;
    }

    currentUserUpdateFailed(error) {
      return error;
    }

    logoutCurrentUser() {
      return dispatch => {
        dispatch();
        registryUserResource.raw('POST', 'logout')
          .then(() => {
            deleteAccessTokenCookie();

            this.resetAllData();
          });
      };
    }
  }

  return alt.createActions(RegistryUserActions);
}
