import React from 'react';
import { getPresenceLabel } from '../../components';
import { Label } from './Label';
import { FilterSelection } from '../../model';

type PresenceSelectorProps = Readonly<{
  onChange: (property: string, newPresence: number | undefined) => void;
  label: string;
  currentSelection: FilterSelection;
  property: string;
  inline?: boolean;
}>

export const PresenceSelector: React.FC<PresenceSelectorProps> = ({ onChange, label, currentSelection, property, inline }) => {
  const presenceLabel = getPresenceLabel(1);
  const tmpOutCampLabel = getPresenceLabel(2);
  const outCampLabel = getPresenceLabel(3);

  return (
    <Label label={ label } inline={ inline }>
      <select onChange={ event => onChange(property, event.target.value === '' ? undefined : Number(event.target.value)) } value={ currentSelection[property] as string || '' }>
        <option value=""></option>
        <option value="1">{ presenceLabel }</option>
        <option value="2">{ tmpOutCampLabel }</option>
        <option value="3">{ outCampLabel }</option>
      </select>
    </Label>
  );
};
