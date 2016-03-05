// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import Alt from 'alt';
import Superagent from 'superagent';
import SuperagentAsPromised from 'superagent-as-promised';

import * as components from './components';
import * as stores from './stores';
import * as actions from './actions';
import { getRestfulResource } from './utils';

const request = SuperagentAsPromised(Superagent);
const RestfulResource = getRestfulResource(request);
const participantResource = new RestfulResource('/api/participants/');

const alt = new Alt();
const participantActions = actions.getParticipantActions(alt, participantResource);
const participantStore = stores.getParticipantStore(alt, participantActions);

const app = components.getApp();
const homepage = components.getHomepage();
const ParticipantListPage = components.getParticipantListPage();
const ParticipantDetailsPage = components.getParticipantDetailsPage(participantStore, participantActions);
const UserManagementPage = components.getUserManagementPage();

const routes = (
  <Router history={ createBrowserHistory() }>
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
