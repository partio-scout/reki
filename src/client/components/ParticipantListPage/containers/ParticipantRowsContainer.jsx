import React from 'react';
import { connect } from 'react-redux';
import Spinner from 'react-spinner';
import { ParticipantRow } from '../../../components';
import { createStateMapper } from '../../../redux-helpers';

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

export function getParticipantRowsContainer() {
  const mapStateToProps = createStateMapper({
    participants: state => state.participants.participants,
    loading: state => state.participants.loading,
  });

  function isChecked(checked, participantId) {
    return checked.indexOf(participantId) >= 0;
  }

  function ParticipantRowsContainer(props) {
    const {
      checked,
      checkboxCallback,
      columnCount,
      availableDates,
    } = props;

    const rowCreator = (element, index) => <ParticipantRow key={ element.participantId } isChecked={ isChecked(checked, element.participantId) } checkboxCallback={ checkboxCallback } availableDates={ availableDates } participant={ element } index={ index } offset={ props.offset }/>;

    return props.loading
      ? (
        <tbody>
          <tr>
            <td colSpan={ columnCount }>
              <Spinner />
            </td>
          </tr>
        </tbody>
      ) : (
        <Tbody rowCreator={ rowCreator } elements={ props.participants } />
      );
  }

  ParticipantRowsContainer.propTypes = {
    checked: React.PropTypes.array,
    checkboxCallback: React.PropTypes.func,
    availableDates: React.PropTypes.array.isRequired,
    columnCount: React.PropTypes.number,
    offset: React.PropTypes.number,
  };

  return connect(mapStateToProps)(ParticipantRowsContainer);
}
