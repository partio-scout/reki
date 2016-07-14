import React from 'react';

export function getLogin(userActions) {
  class Login extends React.Component {
    constructor(props) {
      super(props);
      this.submit = this.submit.bind(this);
    }
    submit(){
      const email = this.refs['email'].value;
      const password = this.refs['password'].value;
      userActions.loginOffline(email, password);
    }
    render() {
      return (
        <div>
          <form horizontal>
            <label htmlFor="email">Email</label><br/>
            <input ref="email" type="email" name="email" placeholder="Email"/><br/>
            <label htmlFor="password">Password</label><br/>
            <input ref="password" type="password" name="password" placeholder="Password"/><br/>
          </form>
          <button onClick={ this.submit }>
            Sign in
          </button>
        </div>
      );
    }
  }
  return Login;
}
