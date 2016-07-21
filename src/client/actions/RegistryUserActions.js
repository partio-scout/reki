import Cookie from 'js-cookie';

function deleteAccessTokenCookie() {
  Cookie.remove('accessToken');
}

export function getRegistryUserActions(alt, registryUserResource, errorActions) {
  class RegistryUserActions {
    resetAllData() {
      return null;
    }

    loadRegistryUserList() {
      return dispatch => {
        dispatch();
        registryUserResource.findAll('includePresence=true')
          .then(registryUserList => this.registryUserListUpdated(registryUserList),
                err => errorActions.error(err, 'Käyttäjiä ei voitu ladata'));
      };
    }

    registryUserListUpdated(registryUsers) {
      return registryUsers;
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
                  err => errorActions.error(err, 'Käyttäjätietoja ei voitu ladata'));
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
            } else if (err.status === 400) {
              errorActions.error(err, 'Väärä käyttäjätunnus tai salasana');
            } else {
              errorActions.error(err, 'Kirjautuminen epäonnistui');
            }
          });
      };
    }

    offlineLoginNotEnabled(tried) {
      return tried;
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
