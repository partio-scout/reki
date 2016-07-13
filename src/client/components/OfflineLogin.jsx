import React from 'react';

export function getLogin(userActions) {
  class Login extends React.Component {
    submit(){
      const form = document.forms[0];
      const email = form.elements['email'].value;
      const password = form.elements['password'].value;
      userActions.loginOffline(email, password);
    }
    render() {
      return (
        <form horizontal onSubmit={ this.submit }>
          <label htmlFor="email">Email</label><br/>
          <input type="email" name="email" placeholder="Email"/><br/>
          <label htmlFor="password">Password</label><br/>
          <input type="password" name="password" placeholder="Password"/><br/>
          <button type="submit">
            Sign in
          </button>
        </form>
      );
    }
  }
  return Login;
}
