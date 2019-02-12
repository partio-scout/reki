import React from 'react';
import { Button } from 'react-bootstrap';

export function getLoginPromptPage() {
  return function() {
    return (
      <div>
        <h1>Tämä sivu vaatii kirjautumisen.</h1>
        <p>
          <Button
            href="/login/partioid"
            bsStyle="primary"
            bsSize="large">
            Kirjaudu sisään Partio ID:llä
          </Button>
        </p>
      </div>
    );
  };
}
