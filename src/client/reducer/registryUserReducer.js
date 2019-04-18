import { loop, Cmd } from 'redux-loop';
import { createReducer, always, staticCmd, actionCmd, payloadToStateProp } from '../redux-helpers';
import * as actions from '../actions';
import { withDefaultOpts } from '../fetch';

const initialState = {
  loggedIn: false,
  currentUser: null,
  registryUsers: [],
  offlineLoginTriedWhileDisabled: false,
};

export const errorActionCreator = message => error => actions.displayError({ error, message });

export const createRegistryUserReducer = registryUserResource => createReducer({
  [actions.RESET_ALL_DATA]: always(initialState),

  [actions.LOAD_REGISTRY_USER_LIST]: staticCmd(Cmd.run(
    () => registryUserResource.findAll('includePresence=true'),
    {
      successActionCreator: actions.registryUserListUpdated,
      failActionCreator: errorActionCreator('Käyttäjiä ei voitu ladata'),
    })),

  [actions.REGISTRY_USER_LIST_UPDATED]: payloadToStateProp('registryUsers'),

  [actions.UPDATE_LOGIN_STATUS]: payloadToStateProp('loggedIn'),

  [actions.LOAD_CURRENT_USER]: state => loop(state, Cmd.run(() => registryUserResource.raw('get', 'currentUser').catch(() => null), { successActionCreator: actions.currentUserUpdated })),

  [actions.CURRENT_USER_UPDATED]: (state, action) => loop({ currentUser: action.payload }, Cmd.action(actions.updateLoginStatus(!!action.payload))),

  [actions.LOGIN_OFFLINE]: actionCmd(action => Cmd.run(
    () => fetch('/login/password', withDefaultOpts({ method: 'POST', headers: { Authorization: `Basic ${btoa([action.payload.email, action.payload.password].join(':'))}` } })).then(response => response.ok ? response.json() : Promise.reject({ status: response.status, message: 'Kirjautuminen epäonnistui' })),
    {
      successActionCreator: actions.loginOfflineSuccess,
      failActionCreator: actions.loginOfflineFailed,
    })),

  [actions.LOGIN_OFFLINE_SUCCESS]: actionCmd(action => Cmd.run(() => location.href = '/')),

  [actions.LOGIN_OFFLINE_FAILED]: actionCmd(action => {
    const err = action.payload;
    if (err.status === 404) {
      return Cmd.action(actions.offlineLoginNotEnabled());
    } else if (err.status === 400) {
      return Cmd.action(actions.displayError({ error: err, message: 'Väärä käyttäjätunnus tai salasana.' }));
    } else {
      return Cmd.action(actions.displayError({ error: err, message: 'Kirjautuminen epäonnistui.' }));
    }
  }),

  [actions.OFFLINE_LOGIN_NOT_ENABLED]: always({ offlineLoginTriedWhileDisabled: true }),

  [actions.LOGOUT_CURRENT_USER]: staticCmd(Cmd.run(
    () => registryUserResource.raw('POST', 'logout'),
    {
      successActionCreator: actions.currentUserLoggedOut,
    })),

  [actions.CURRENT_USER_LOGGED_OUT]: staticCmd(Cmd.action(actions.resetAllData())),

  [actions.BLOCK_USER]: actionCmd(action => Cmd.run(
    () => registryUserResource.raw('POST', `${action.payload.userId}/block`),
    {
      successActionCreator: actions.loadRegistryUserList,
    })),

  [actions.UNBLOCK_USER]: actionCmd(action => Cmd.run(
    () => registryUserResource.raw('POST', `${action.payload.userId}/unblock`),
    {
      successActionCreator: actions.loadRegistryUserList,
    })),
}, initialState);
