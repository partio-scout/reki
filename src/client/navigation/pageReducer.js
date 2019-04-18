import { loop, Cmd } from 'redux-loop';
import * as actions from '../actions';
import * as navigationActions from './actions';
import { createReducer, always } from '../redux-helpers';
import { NOT_FOUND } from 'redux-first-router';

const setPage = currentPage => always({ currentPage });

export const pageReducer = createReducer({
  [navigationActions.NAVIGATE_TO_HOME]: setPage('home'),
  [navigationActions.NAVIGATE_TO_PARTICIPANTS_LIST]: (state, action) => loop({ currentPage: 'participantsList' }, Cmd.list([
    Cmd.action(actions.loadSearchFilterList()),
  ])),
  [navigationActions.NAVIGATE_TO_PARTICIPANT_DETAILS]: setPage('participantDetails'),
  [navigationActions.NAVIGATE_TO_LOGIN]: setPage('login'),
  [navigationActions.NAVIGATE_TO_ADMIN]: setPage('admin'),
  [NOT_FOUND]: setPage('notFound'),
}, { currentPage: 'home' });
