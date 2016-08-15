import Cookie from 'js-cookie';
import _ from 'lodash';

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

    createRegistryUser(user) {
      return dispatch => {
        registryUserResource.create(user)
          .then(() => this.loadRegistryUserList(),
                err => errorActions.error(err, 'Käyttäjää ei voitu luoda.'));
      };
    }

    deleteRegistryUser(userId) {
      return dispatch => {
        registryUserResource.del(userId)
          .then(() => this.loadRegistryUserList(),
                err => errorActions.error(err, 'Käyttäjää ei voitu poistaa.'));
      };
    }

    loadRegistryUserById(userId) {
      return dispatch => {
        registryUserResource.findById(userId, 'filter[include]=rekiRoles')
          .then(user => this.registryUserByIdUpdated(user),
                err => errorActions.error(err, 'Käyttäjän tietoja ei voitu ladata'));
      };
    }

    registryUserByIdUpdated(user) {
      if (user.rekiRoles) {
        user.roles = _.map(user.rekiRoles, role => role.name);
        delete user.rekiRoles;
      }
      return user;
    }

    updateRegistryUser(user) {
      return dispatch => {
        registryUserResource.update(user.id, user)
          .then(() => this.loadRegistryUserList(),
                err => errorActions.error(err, 'Käyttäjää ei voitu päivittää.'));
      };
    }

    loadRoleNames() {
      return dispatch => {
        registryUserResource.raw('GET', '/allRoleNames')
          .then(roles => this.roleNamesUpdated(roles),
                err => this.errorActions.error(err, 'Rooleja ei voitu ladata.'));
      };
    }

    roleNamesUpdated(roles) {
      return roles;
    }
  }

  return alt.createActions(RegistryUserActions);
}
