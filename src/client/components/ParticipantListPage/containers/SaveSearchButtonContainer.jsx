import React from 'react';
import { Button } from 'react-bootstrap';

export function getSaveSearchButtonContainer(participantActions) {
  function saveSearch() {
    participantActions.saveSearchFilter('Tiikeri-haku', location.search);
  }

  class SaveSearchButtonContainer extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <Button className="sm-position-right-top pull-right" bsStyle="primary" onClick={ saveSearch }>
          Tallenna haku
        </Button>
      );
    }
  }

  return SaveSearchButtonContainer;
}
