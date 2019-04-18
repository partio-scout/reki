import React from 'react';
import { connect } from 'react-redux';
import { createStateMapper } from '../redux-helpers';

class EmptyComponent extends React.Component {
  render() {
    return false;
  }
}

export function restrictComponent(Component, AlternativeComponent) {
  AlternativeComponent = AlternativeComponent || EmptyComponent;

  const RestrictedComponent = props => props.loggedIn ? <Component { ...props } /> : <AlternativeComponent />;

  const mapStateToProps = createStateMapper({
    loggedIn: state => state.registryUsers.loggedIn,
  });

  return connect(mapStateToProps)(RestrictedComponent);
}
