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
  const rowCreator = element => <ParticipantRow key={ element.participantId } participant={ element } />;
  function ParticipantRowsContainer() {
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

  return ParticipantRowsContainer;
}
