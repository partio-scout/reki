import { createStore as reduxCreateStore, compose, applyMiddleware } from 'redux';
import { combineReducers, install } from 'redux-loop';
import { connectRoutes } from './navigation/routes';
import { pageReducer } from './navigation/pageReducer';
import { errorReducer } from './reducer/errorReducer';
import { createRegistryUserReducer } from './reducer/registryUserReducer';
import { createParticipantReducer } from './reducer/participantReducer';
import { createSearchFilterReducer } from './reducer/searchFilterReducer';

export const createStore = ({ registryUserResource, participantResource, searchFilterResource, optionResource, participantDateResource }) => {
  const composeEnhancers = process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const routes = connectRoutes();

  const rootReducer = combineReducers({
    errors: errorReducer,
    registryUsers: createRegistryUserReducer(registryUserResource),
    participants: createParticipantReducer(participantResource),
    searchFilters: createSearchFilterReducer(searchFilterResource, optionResource, participantDateResource),
    location: routes.reducer,
    page: pageReducer,
  });

  const middleware = applyMiddleware(routes.middleware);
  const enhancer = composeEnhancers(install(), routes.enhancer, middleware);
  return reduxCreateStore(rootReducer, undefined, enhancer);
};
