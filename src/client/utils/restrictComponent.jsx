import React from 'react';

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
      this.state = this.selectState(UserStore.getState());
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
      if (this.state.currentUser) {
        return (<Component { ...this.props }/>);
      } else {
        return (<AlternativeComponent />);
      }
    }
  }

  return RestrictedComponent;
}
