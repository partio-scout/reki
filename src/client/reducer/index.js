import { combineReducers } from 'redux-loop';
import { errorReducer } from './errorReducer';
import { createRegistryUserReducer } from './registryUserReducer';

export const createRootReducer = (registryUserResource, routesReducer) => combineReducers({
  errors: errorReducer,
  registryUsers: createRegistryUserReducer(registryUserResource),
  routes: routesReducer,
});
