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

    componentWillUnMount() {
      userStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      this.setState(state);
    }

    submit() {
      const email = this.refs['email'].value;
      const password = this.refs['password'].value;
      userActions.loginOffline(email, password);
    }

    render() {
      let loginComponent = '';
      if (this.state.offlineLoginTriedWhileDisabled) {
        loginComponent = (
          <div> Offline-kirjautuminen ei ole käytössä. </div>
        );
      } else {
        loginComponent = (
          <div>
            <form horizontal>
              <label htmlFor="email">Sähköposti</label><br/>
              <input ref="email" type="email" name="email" placeholder="Sähköposti"/><br/>
              <label htmlFor="password">Salasana</label><br/>
              <input ref="password" type="password" name="password" placeholder="Salasana"/><br/>
            </form>
            <button onClick={ this.submit }>
              Kirjaudu sisään
            </button>
          </div>
        );
      }
      return loginComponent;
    }
  }
  return Login;
}
