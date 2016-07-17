import _ from 'lodash';
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export function getSessionTimeoutNotification(accessToken) {
  return class SessionTimeoutNotification extends React.Component {
    constructor(props) {
      super(props);
      this.state = { sessionExpired: false };
    }

    setSessionExpiryTimeout() {
      const ttlInMilliseconds = accessToken.ttl * 1000;
      const tokenExpires = (new Date(accessToken.created).getTime()) + ttlInMilliseconds;
      const millisecondsLeft = tokenExpires - Date.now();

      // If the access token has already expired, we're already shown the login page
      // so there's no need to display this notification
      if (millisecondsLeft > 0) {
        this.timeout = setTimeout(() => this.setState({ sessionExpired: true }), millisecondsLeft);
      }
    }

    componentDidMount() {
      if (accessToken) {
        this.setSessionExpiryTimeout();
      }
    }

    componentWillUnmount() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    }

    render() {
      return (
        <Modal show={ this.state.sessionExpired } onHide={ _.noop }>
          <Modal.Header>
            <Modal.Title>Istuntosi on vanhentunut</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Ole hyvä ja kirjaudu sisään uudelleen.
          </Modal.Body>
          <Modal.Footer>
            <div className="text-center">
              <Button href="/saml/login" bsStyle="primary">Kirjaudu sisään</Button>
              <Button href="/">Peruuta</Button>
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  };
}
