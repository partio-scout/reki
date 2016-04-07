import _ from 'lodash';

export function pureShouldComponentUpdate(nextProps, nextState) {
  return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
}

export function changeQueryParameter(currentLocation, parameterName, newValue) {
  return changeQueryParameters(currentLocation, { [parameterName]: newValue });
}

export function changeQueryParameters(currentLocation, parameters) {
  const currentLocationWithoutQuery = _.omit(currentLocation, 'search', 'query', 'action');
  const currentQueryWithoutParameter = _.omit(currentLocation.query, Object.keys(parameters));

  const newQuery = _.merge(currentQueryWithoutParameter, _.pickBy(parameters, (value, key) => value));
  const newLocation = _.merge(currentLocationWithoutQuery, { query: newQuery });

  return newLocation;
}
