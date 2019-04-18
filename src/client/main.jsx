// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import { render } from 'react-dom';
import request from 'superagent';
import moment from 'moment';
import { Provider } from 'react-redux';
import { createStore } from './store';

import * as components from './components';
import * as actions from './actions';
import { getRestfulResource } from './utils';
import { Router } from './navigation/router';

moment.locale('fi');

// Get REST API access token

const RestfulResource = getRestfulResource(request);
const participantResource = new RestfulResource('/api/participants');
const participantDateResource = new RestfulResource('/api/participantDates');
const registryUserResource = new RestfulResource('/api/registryusers');
const searchFilterResource = new RestfulResource('/api/searchfilters');
const optionResource = new RestfulResource('/api/options');

const store = createStore({ registryUserResource, searchFilterResource, participantResource, participantDateResource, optionResource });

const App = components.getApp();

store.dispatch(actions.loadCurrentUser());
store.dispatch(actions.loadFlashes());

const appRoot = (
  <Provider store={ store }>
    <App>
      <Router />
    </App>
  </Provider>
);

render(appRoot, document.getElementById('app'));
