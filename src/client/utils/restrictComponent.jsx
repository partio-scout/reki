import React from 'react';
import { pureShouldComponentUpdate } from './pureShouldComponentUpdate';

class EmptyComponent extends React.Component {
  render() {
    return false;
  }
}

export function restrictComponent(UserStore, Component, AlternativeComponent) {
  AlternativeComponent = AlternativeComponent || EmptyComponent;

  class RestrictedComponent extends React.Component {
    constructor(props) {
      super(props);

      this.selectState = this.selectState.bind(this);
      this.onChange = this.onChange.bind(this);

      this.state = this.selectState(UserStore.getState());

      this.shouldComponentUpdate = pureShouldComponentUpdate.bind(this);
    }

    componentDidMount() {
      UserStore.listen(this.onChange);
    }

    componentWillUnmount() {
      UserStore.unlisten(this.onChange);
    }

    onChange(state) {
      this.setState(this.selectState(state));
    }

    selectState(state) {
      return { currentUser: state.currentUser };
    }

    render() {
      if (this.state.loggedIn) {
        return (<Component { ...this.props }/>);
      } else {
        return (<AlternativeComponent />);
      }
    }
  }

  return RestrictedComponent;
}
