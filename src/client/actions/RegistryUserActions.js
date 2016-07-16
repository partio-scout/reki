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
          registryUserResource.findById(id, 'filter[include]=rekiRoles')
            .then(newCurrentUser => this.currentUserUpdated(newCurrentUser),
                  error => this.currentUserUpdateFailed(error));
        }
      };
    }

    currentUserUpdated(newCurrentUser) {
      return newCurrentUser;
    }

    loginOffline(email, pass) {
      return dispatch => {
        dispatch();
        return registryUserResource.raw('POST', 'login', { 'body': { 'email': email, 'password': pass } })
          .then(data => Cookie.set('accessToken', data, { secure: (window.location.protocol === 'https:') }))
          .then(() => location.reload())
          .catch(err => {
            if (err.status === 404) {
              this.offlineLoginNotEnabled(true);
            } else {
              this.offlineLoginFailed(err);
            }
          });
      };
    }

    offlineLoginNotEnabled(tried) {
      return tried;
    }

    offlineLoginFailed(err) {
      return err;
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

    blockUser(userId) {
      return dispatch => {
        registryUserResource.raw('POST', `${userId}/block`)
          .then(() => this.loadRegistryUserList());
      };
    }

    unblockUser(userId) {
      return dispatch => {
        registryUserResource.raw('POST', `${userId}/unblock`)
          .then(() => this.loadRegistryUserList());
      };
    }
  }

  return alt.createActions(RegistryUserActions);
}
