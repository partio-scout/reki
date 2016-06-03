// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import Alt from 'alt';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import superagent from 'superagent';
import superagentAsPromised from 'superagent-as-promised';

import * as components from './components';
import * as stores from './stores';
import * as actions from './actions';
import { getRestfulResource } from './utils';

const request = superagentAsPromised(superagent);

const RestfulResource = getRestfulResource(request);
const participantResource = new RestfulResource('/api/participants');
const registryUserResource = new RestfulResource('/api/registryusers');
const searchFilterResource = new RestfulResource('api/searchfilters');

const alt = new Alt();

const participantActions = actions.getParticipantActions(alt, participantResource, searchFilterResource);
const registryUserActions = actions.getRegistryUserActions(alt, registryUserResource);
const participantStore = stores.getParticipantStore(alt, participantActions);
const registryUserStore = stores.getRegistryUserStore(alt, registryUserActions);

const app = components.getApp();
const homepage = components.getHomepage();
const ParticipantDetailsPage = components.getParticipantDetailsPage(participantStore, participantActions);
const ParticipantListPage = components.getParticipantListPage(participantStore, participantActions);
const UserManagementPage = components.getUserManagementPage(registryUserStore, registryUserActions);

const routes = (
  <Router history={ browserHistory }>
    <Route path="/" component={ app }>
      <IndexRoute component={ homepage } />
      <Route path="participants">
        <IndexRoute component={ ParticipantListPage } />
        <Route path=":id" component={ ParticipantDetailsPage } />
      </Route>
      <Route path="admin" component={ UserManagementPage } />
    </Route>
  </Router>
);

render(routes, document.getElementById('app'));
