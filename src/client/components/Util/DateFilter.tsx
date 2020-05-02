import React, { useCallback } from 'react';
import _ from 'lodash';
import moment from 'moment';
import * as Rt from 'runtypes';
import { devValidate } from '../../devValidate';
import { AvailableDates, FilterSelection } from '../../model';

export type DateFilterProps = Readonly<{
  availableDates: AvailableDates;
  currentSelection: FilterSelection;
  label: string;
  property: string;
  onChange: (property: string, value: unknown) => void;
}>

const expectedValueType = Rt.Array(Rt.String).asReadonly();

export const DateFilter: React.FC<DateFilterProps> = ({ availableDates, currentSelection, label, property, onChange }) => {
  const value = currentSelection[property];
  devValidate(value, expectedValueType);

  const handleValueChanged = useCallback(event => {
    const checked = event.target.checked;
    const thisDate = event.target.value;
    const newDates = Array.from(value || []);

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
};
