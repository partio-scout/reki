// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import Alt from 'alt';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import request from 'superagent';
import moment from 'moment';

import * as components from './components';
import * as stores from './stores';
import * as actions from './actions';
import { getRestfulResource } from './utils';

moment.locale('fi');

// Get REST API access token

const RestfulResource = getRestfulResource(request);
const participantResource = new RestfulResource('/api/participants');
const participantDateResource = new RestfulResource('/api/participantDates');
const searchFilterResource = new RestfulResource('/api/searchfilters');
const optionResource = new RestfulResource('/api/options');

const alt = new Alt();

const errorActions = actions.getErrorActions(alt);
const participantActions = actions.getParticipantActions(alt, participantResource, errorActions);
const searchFilterActions = actions.getSearchFilterActions(alt, searchFilterResource, participantResource, participantDateResource, optionResource, errorActions);

const errorStore = stores.getErrorStore(alt, errorActions);
const participantStore = stores.getParticipantStore(alt, participantActions);
const searchFilterStore = stores.getSearchFilterStore(alt, searchFilterActions);

const app = components.getApp(errorStore, errorActions);
const homepage = components.getHomepage();
const ParticipantDetailsPage = components.getParticipantDetailsPage(participantStore, participantActions);
const ParticipantListPage = components.getParticipantListPage(participantStore, participantActions, searchFilterActions, searchFilterStore);
const participantSidebar = components.getParticipantSidebar(searchFilterStore, searchFilterActions);
const defaultSidebar = components.defaultSidebar;

const routes = (
  <Router history={ browserHistory }>
    <Route path="/" component={ app }>
      <IndexRoute components={ { main:homepage, sidebar: defaultSidebar } } />
      <Route path="participants">
        <IndexRoute components={ { main: ParticipantListPage, sidebar: participantSidebar } } />
        <Route path=":id" components={ { main: ParticipantDetailsPage, sidebar: defaultSidebar } } />
      </Route>
    </Route>
  </Router>
);

render(routes, document.getElementById('app'));
