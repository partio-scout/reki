// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import Alt from 'alt';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import superagent from 'superagent';
import superagentAsPromised from 'superagent-as-promised';
import Cookie from 'js-cookie';

import * as components from './components';
import * as stores from './stores';
import * as actions from './actions';
import { getRestfulResource, restrictComponent } from './utils';

// Get REST API access token

const accessToken = Cookie.getJSON('accessToken');

const request = superagentAsPromised(superagent);

const RestfulResource = getRestfulResource(request);
const participantResource = new RestfulResource('/api/participants', accessToken);
const registryUserResource = new RestfulResource('/api/registryusers', accessToken);
const searchFilterResource = new RestfulResource('/api/searchfilters', accessToken);

const alt = new Alt();

const participantActions = actions.getParticipantActions(alt, participantResource);
const searchFilterActions = actions.getSearchFilterActions(alt, searchFilterResource);
const registryUserActions = actions.getRegistryUserActions(alt, registryUserResource);

const participantStore = stores.getParticipantStore(alt, participantActions, registryUserActions);
const searchFilterStore = stores.getSearchFilterStore(alt, searchFilterActions);
const registryUserStore = stores.getRegistryUserStore(alt, registryUserActions);

const app = components.getApp(registryUserStore, registryUserActions);
const login = components.getLogin(registryUserActions);
const homepage = components.getHomepage();
const LoginPromptPage = components.getLoginPromptPage();
const ParticipantDetailsPage = restrictComponent(
  registryUserStore,
  components.getParticipantDetailsPage(participantStore, participantActions),
  LoginPromptPage
);
const ParticipantListPage = restrictComponent(
  registryUserStore,
  components.getParticipantListPage(participantStore, participantActions, searchFilterActions),
  LoginPromptPage
);
const UserManagementPage = restrictComponent(
  registryUserStore,
  components.getUserManagementPage(registryUserStore, registryUserActions),
  LoginPromptPage
);
const participantSidebar = restrictComponent(
  registryUserStore,
  components.getParticipantSidebar(searchFilterStore, searchFilterActions)
);
const defaultSidebar = restrictComponent(registryUserStore, components.defaultSidebar);

const accessTokenValid = accessToken && accessToken.userId && accessToken.ttl > ((Date.now() - new Date(accessToken.created)) / 1000);

if (accessTokenValid) {
  registryUserActions.loadCurrentUser(accessToken.userId);
  registryUserActions.updateLoginStatus(true);
} else {
  Cookie.remove('accessToken');
  registryUserActions.loadCurrentUser();
  registryUserActions.updateLoginStatus(false);
}

const routes = (
  <Router history={ browserHistory }>
    <Route path="/" component={ app }>
      <IndexRoute components={ { main:homepage, sidebar: defaultSidebar } } />
      <Route path="participants">
        <IndexRoute components={ { main: ParticipantListPage, sidebar: participantSidebar } } />
        <Route path=":id" components={ { main: ParticipantDetailsPage, sidebar: defaultSidebar } } />
      </Route>
      <Route path="login" components={ { main: login, sidebar: defaultSidebar } } />
      <Route path="admin" components={ { main: UserManagementPage, sidebar: defaultSidebar } } />
    </Route>
  </Router>
);

render(routes, document.getElementById('app'));
