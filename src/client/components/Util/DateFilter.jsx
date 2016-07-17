import React from 'react';
import { Dropdown, Input, Button } from 'react-bootstrap';
import _ from 'lodash';
import moment from 'moment';

export function getDateFilter() {
  function dateFilter({ value, label, property, options, onChange }) {

    function handleValueChanged(event) {
      const checked = event.target.checked;
      const thisDate = event.target.value;
      const newDates = value || [];

      if (checked) {
        newDates.push(thisDate);
      } else {
        _.pull(newDates, thisDate);
      }

      onChange(property, newDates);
    }

    return (
      <div>
        <Dropdown className="date-filter" id={ property }>
          <Button bsRole="toggle">{ value.length ? `${label} (${value.length})` : label } <span className="caret"></span></Button>

          <div bsRole="menu" className="dropdown-menu">
            <ul className="list-unstyled">
              { options.map( (row, key) => <li key={ key }><Input type="checkbox" value={ row.date } label={ moment(row.date).format('L') } onChange={ handleValueChanged } checked={ _.includes(value, row.date) } /></li>) }
            </ul>
          </div>
        </Dropdown>
      </div>
    );
  }

  dateFilter.propTypes = {
    value: React.PropTypes.any,
    label: React.PropTypes.string.isRequired,
    property: React.PropTypes.string.isRequired,
    options: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return dateFilter;
}
