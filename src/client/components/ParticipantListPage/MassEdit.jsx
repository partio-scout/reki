import React, { useState } from 'react';
import { LoadingButton, PresenceSelector } from '..';
import { SelectAll } from './SelectAll';

export function MassEdit({ onSubmit, checked, participants, setChecked, participantsLoading }) {
  const [value, setValue] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    if (value !== '') {
      onSubmit(value);
    }
  };

  const handleChange = (p, newValue) => setValue(newValue);
  const count = checked.length;

  return (
    <form className="mass-edit" onSubmit={ handleSubmit }>
      <SelectAll checked={ checked } participants={ participants } setChecked={ setChecked } />
      <PresenceSelector inline label="Tila" onChange={ handleChange } currentSelection={ { presence: value } } property="presence" />
      <LoadingButton disabled={ !value || count === 0  } loading={ participantsLoading } label="Tallenna" labelWhileLoading="Tallennetaan…"/>
    </form>
  );
}
