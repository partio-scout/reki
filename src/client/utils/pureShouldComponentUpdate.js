import _ from 'lodash';

export function pureShouldComponentUpdate(nextProps, nextState) {
  return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
}
