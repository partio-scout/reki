// This require tells webpack to compile the stylesheet
require('./styles.scss');

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import * as components from './components';

const app = components.getApp();
const homepage = components.getHomepage();

const routes = (
  <Router history={ createBrowserHistory() }>
    <Route path="/" component={ app }>
      <IndexRoute component={ homepage } />
    </Route>
  </Router>
);

render(routes, document.getElementById('app'));
