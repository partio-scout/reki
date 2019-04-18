import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { createStateMapper } from '../redux-helpers';

export function getLogin() {
  class Login extends React.Component {
    constructor(props) {
      super(props);

      this.state = { email: '', password: '' };
    }

    submit(e) {
      e.preventDefault();
      const email = this.state.email;
      const password = this.state.password;
      this.props.loginOffline({ email, password });
    }

    render() {
      if (this.props.offlineLoginTriedWhileDisabled) {
        return (
          <div> Offline-kirjautuminen ei ole käytössä. </div>
        );
      } else {
        return (
          <div>
            <form horizontal onSubmit={ e => this.submit(e) }>
              <label htmlFor="email">Sähköposti</label><br/>
              <input value={ this.state.email } onChange={ e => this.setState({ email: e.target.value }) } type="email" name="email" placeholder="Sähköposti"/><br/>
              <label htmlFor="password">Salasana</label><br/>
              <input value={ this.state.password } onChange={ e => this.setState({ password: e.target.value }) } type="password" name="password" placeholder="Salasana"/><br/>
              <button type="submit">
                Kirjaudu sisään
              </button>
            </form>
          </div>
        );
      }
    }
  }

  const mapStateToProps = createStateMapper({
    offlineLoginTriedWhileDisabled: state => state.registryUsers.offlineLoginTriedWhileDisabled,
  });
  const mapDispatchToProps = {
    loginOffline: actions.loginOffline,
  };

  return connect(mapStateToProps, mapDispatchToProps)(Login);
}
