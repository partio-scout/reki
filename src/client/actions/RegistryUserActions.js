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

    loadCurrentUser() {
      return dispatch => {
        dispatch();
        registryUserResource.raw('get', 'currentUser')
          .catch(() => null)
          .then(newCurrentUser => {
            this.currentUserUpdated(newCurrentUser);
            this.updateLoginStatus(!!newCurrentUser);
          });
      };
    }

    currentUserUpdated(newCurrentUser) {
      return newCurrentUser;
    }

    loginOffline(email, pass) {
      return dispatch => {
        dispatch();
        return fetch('/login/password', {
          method: 'POST',
          mode: 'same-origin',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa([email, pass].join(':'))}`,
          },
        })
          .then(response => {
            if (response.ok) {
              location.reload();
            } else if (response.status === 404) {
              this.offlineLoginNotEnabled(true);
            } else {
              throw new Error('Kirjautuminen epäonnistui');
            }
          })
          .catch(err => {
            errorActions.error(err);
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
