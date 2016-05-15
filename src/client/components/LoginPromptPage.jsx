import React from 'react';
import { Button, Alert } from 'react-bootstrap';

export function getLoginPromptPage() {
  return function() {
    return (
      <div>
        <h1>Tämä sivu vaatii kirjautumisen.</h1>
        <p>
          <Button
            href="/saml/login"
            bsStyle="primary"
            bsSize="large">
            Kirjaudu sisään Partio ID:llä
          </Button>
        </p>
        <Alert bsSize="medium" bsStyle="info">Kirjautumalla hyväksyn henkilötietojeni luovutuksen käsiteltäväksi Euroopan Talousalueen ulkopuolelle.</Alert>
      </div>
    );
  };
}
