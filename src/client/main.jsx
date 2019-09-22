// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import Alt from 'alt';
import { render } from 'react-dom';
import moment from 'moment';

import * as components from './components';
import * as stores from './stores';
import * as actions from './actions';
import { getRestfulResource, restrictComponent } from './utils';
import createMatcher from 'feather-route-matcher';

moment.locale('fi');

const RestfulResource = getRestfulResource();
const participantResource = RestfulResource('/api/participants');
const participantDateResource = RestfulResource('/api/participantDates');
const registryUserResource = RestfulResource('/api/registryusers');
const searchFilterResource = RestfulResource('/api/searchfilters');
const optionResource = RestfulResource('/api/options');

const alt = new Alt();

const errorActions = actions.getErrorActions(alt);
const participantActions = actions.getParticipantActions(alt, participantResource, errorActions);
const searchFilterActions = actions.getSearchFilterActions(alt, searchFilterResource, participantResource, participantDateResource, optionResource, errorActions);
const registryUserActions = actions.getRegistryUserActions(alt, registryUserResource, errorActions);

const errorStore = stores.getErrorStore(alt, errorActions);
const participantStore = stores.getParticipantStore(alt, participantActions, registryUserActions);
const searchFilterStore = stores.getSearchFilterStore(alt, searchFilterActions);
const registryUserStore = stores.getRegistryUserStore(alt, registryUserActions);

const App = components.getApp(registryUserStore, registryUserActions, errorStore, errorActions);
const Login = components.getLogin(registryUserActions, registryUserStore);
const Homepage = components.getHomepage();
const LoginPromptPage = components.getLoginPromptPage();
const ParticipantDetailsPage = restrictComponent(
  registryUserStore,
  components.getParticipantDetailsPage(participantStore, participantActions),
  LoginPromptPage
);
const ParticipantListPage = // restrictComponent(
  // registryUserStore,
  components.getParticipantListPage(participantStore, participantActions, searchFilterActions, searchFilterStore); //,
// LoginPromptPage
// );
const UserManagementPage = restrictComponent(
  registryUserStore,
  components.getUserManagementPage(registryUserStore, registryUserActions),
  LoginPromptPage
);

registryUserActions.loadCurrentUser();
errorActions.loadFlashes();

const routes = createMatcher({
  '/': Homepage,
  '/participants': ParticipantListPage,
  '/participants/:id': ParticipantDetailsPage,
  '/login': Login,
  '/admin': UserManagementPage,
  '*': Homepage,
});

const {
  page: RouteComponent,
  params,
} = routes(location.pathname);

render(<App><RouteComponent { ...params } /></App>, document.getElementById('app'));
