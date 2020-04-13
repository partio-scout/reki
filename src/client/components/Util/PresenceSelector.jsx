import React from 'react';
import { getPresenceLabel } from '../../components';
import { Label } from './Label';

export function PresenceSelector({ onChange, label, currentSelection, property, inline }) {
  const presenceLabel = getPresenceLabel(1);
  const tmpOutCampLabel = getPresenceLabel(2);
  const outCampLabel = getPresenceLabel(3);

  return (
    <Label label={ label } inline={ inline }>
      <select onChange={ event => onChange(property, event.target.value) } value={ currentSelection[property] || '' }>
        <option value=""></option>
        <option value="1">{ presenceLabel }</option>
        <option value="2">{ tmpOutCampLabel }</option>
        <option value="3">{ outCampLabel }</option>
      </select>
    </Label>
  );
}
