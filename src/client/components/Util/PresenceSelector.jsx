import React from 'react';
import { Input } from 'react-bootstrap';
import { getPresenceLabel } from '../../components';

export function PresenceSelector({ onChange, label, value = 'null' }) {
  const presenceLabel = getPresenceLabel(1);
  const tmpOutCampLabel = getPresenceLabel(2);
  const outCampLabel = getPresenceLabel(3);

  return (
    <Input type="select" label={ label } onChange={ onChange } value={ value }>
      <option value="null"></option>
      <option value="1">{ presenceLabel }</option>
      <option value="2">{ tmpOutCampLabel }</option>
      <option value="3">{ outCampLabel }</option>
    </Input>
  );
}

PresenceSelector.propTypes = {
  onChange: React.PropTypes.func,
  label: React.PropTypes.node,
  value: React.PropTypes.string,
};
