import _ from 'lodash';

export function pureShouldComponentUpdate(nextProps, nextState) {
  return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
}

export function changeQueryParameter(currentLocation, parameterName, newValue) {
  const currentLocationWithoutQuery = _.omit(currentLocation, 'search', 'query', 'action');
  const currentQueryWithoutParameter = _.omit(currentLocation.query, parameterName);

  const newQuery = !newValue && currentQueryWithoutParameter || _.merge(currentQueryWithoutParameter, { [parameterName]: newValue });
  const newLocation = _.merge(currentLocationWithoutQuery, { query: newQuery });

  return newLocation;
}
