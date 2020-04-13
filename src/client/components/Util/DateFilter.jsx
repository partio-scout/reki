import React, { useCallback } from 'react';
import _ from 'lodash';
import moment from 'moment';

export function DateFilter({ availableDates, currentSelection, label, property, onChange }) {
  const value = currentSelection[property];

  const handleValueChanged = useCallback(event => {
    const checked = event.target.checked;
    const thisDate = event.target.value;
    const newDates = value || [];

    if (checked) {
      newDates.push(thisDate);
    } else {
      _.pull(newDates, thisDate);
    }

    onChange(property, newDates);
  }, [value, property, onChange]);

  return (
    <div>
      <ul>
        { availableDates.map(row => (
          <li key={ row.date }>
            <label>
              <input type="checkbox" value={ row.date } onChange={ handleValueChanged } checked={ _.includes(value, row.date) } />
              { moment(row.date).format('L') }
            </label>
          </li>
        )) }
      </ul>
    </div>
  );
}
