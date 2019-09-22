import React from 'react';
import Spinner from 'react-spinner';
import { ParticipantRow } from '../../../components';

export function ParticipantRowsContainer({
    isChecked,
    checkboxCallback,
    columns,
    availableDates,
    offset,
    participants,
    loading,
  }) {

  if (loading) {
    const columnCount = columns.reduce((acc, elem) => acc + (elem.type === 'availableDates' ? availableDates.length || 1 : 1), 2);
    return (
        <tr>
          <td colSpan={ columnCount }>
            <Spinner />
          </td>
        </tr>
    );
  } else {
    return participants.map((element, index) => (
      <ParticipantRow
        key={ element.participantId }
        columns={ columns }
        isChecked={ isChecked }
        checkboxCallback={ checkboxCallback }
        availableDates={ availableDates }
        participant={ element }
        index={ index }
        offset={ offset }
      />
    ));
  }
}
