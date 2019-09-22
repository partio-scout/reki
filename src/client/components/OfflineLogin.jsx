import React from 'react';

export function getLogin(userActions, userStore) {
  class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = userStore.getState();
      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.submit = this.submit.bind(this);
    }

    componentDidMount() {
      userStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      userStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      this.setState(state);
    }

    submit(event) {
      event.preventDefault();
      const email = this.refs['email'].value;
      const password = this.refs['password'].value;
      userActions.loginOffline(email, password);
    }

    render() {
      if (this.state.offlineLoginTriedWhileDisabled) {
        return (
          <div> Offline-kirjautuminen ei ole käytössä. </div>
        );
      } else {
        return (
          <div>
            <form method="POST" horizontal onSubmit={ this.submit }>
              <label htmlFor="email">Sähköposti</label><br/>
              <input ref="email" type="email" name="email" placeholder="Sähköposti"/><br/>
              <label htmlFor="password">Salasana</label><br/>
              <input ref="password" type="password" name="password" placeholder="Salasana"/><br/>
              <button type="submit">
                Kirjaudu sisään
              </button>
            </form>
          </div>
        );
      }
    }
  }
  return Login;
}
