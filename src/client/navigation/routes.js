import * as rfr from 'redux-first-router';
import * as actions from './actions';

const routesMap = {
  [actions.NAVIGATE_TO_HOME]: '/',
  [actions.NAVIGATE_TO_PARTICIPANTS_LIST]: '/participants',
  [actions.NAVIGATE_TO_PARTICIPANT_DETAILS]: '/participants/:participantId',
  [actions.NAVIGATE_TO_LOGIN]: '/login',
  [actions.NAVIGATE_TO_ADMIN]: '/admin',
};

const querySerializer = {
  stringify: queryObj => new URLSearchParams(Object.entries(queryObj).filter(pair => pair[1] !== undefined)).toString(),
  parse: searchString => {
    const params = new URLSearchParams(searchString);
    const result = {};
    for (const pair of params.entries()) {
      result[pair[0]] = pair[1];
    }
    return result;
  },
};

export const connectRoutes = () => rfr.connectRoutes(routesMap, { querySerializer });
