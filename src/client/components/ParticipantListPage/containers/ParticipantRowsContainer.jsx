import React from 'react';
import AltContainer from 'alt-container';
import { ParticipantRow } from '../../../components';
import { pureShouldComponentUpdate } from '../../../utils';

function Tbody(props) {
  const elements = props.elements || [];

  return (
    <tbody>
      { elements.map(props.rowCreator) }
    </tbody>
  );
}
Tbody.propTypes = {
  elements: React.PropTypes.array,
  rowCreator: React.PropTypes.func,
};

export function getParticipantRowsContainer(participantStore) {
  function ParticipantRowsContainer({ isChecked, checkboxCallback, availableDates }) {
    const rowCreator = element => <ParticipantRow key={ element.participantId } isChecked={ isChecked } checkboxCallback={ checkboxCallback } availableDates={ availableDates } participant={ element } />;

    return (
      <AltContainer
        stores={
          {
            elements: () => ({ store: participantStore, value: participantStore.getState().participants }),
          }
        }
        shouldComponentUpdate={ pureShouldComponentUpdate }
      >
        <Tbody rowCreator={ rowCreator } />
      </AltContainer>
    );
  }

  ParticipantRowsContainer.propTypes = {
    isChecked: React.PropTypes.func,
    checkboxCallback: React.PropTypes.func,
    availableDates: React.PropTypes.array.isRequired,
  };

  return ParticipantRowsContainer;
}
