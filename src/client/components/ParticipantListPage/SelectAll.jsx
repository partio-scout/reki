import React, { useMemo } from 'react';
import _ from 'lodash';

export function SelectAll({ checked, setChecked, participants, hideLabel }) {
  const count = checked.length;
  const allChecked = useMemo(() => checked.length === 0 ? false : _.every(participants, participant => checked.includes(participant)), [checked, participants]);
  const handleChange = event => {
    setChecked(event.target.checked ? participants : []);
  };

  const label = `${ count } ${ (count == 1 ? 'henkilö' : 'henkilöä') } valittu`;

  return (
    <label>
      <input type="checkbox" title="Valitse kaikki" checked={ allChecked } onChange={ handleChange } />
      { hideLabel ? null :  label }
    </label>
  );
}
