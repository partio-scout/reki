import React from 'react';
import { Input } from 'react-bootstrap';
import { getPresenceLabel } from '../../../components';

export function getPresenceFilterContainer() {
  const property = 'presence';

  class PresenceFilterContainer extends React.Component {
    constructor(props) {
      super(props);

      this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
      this.props.onChange(property, e.target.value);
    }

    render() {
      const presenceLabel = getPresenceLabel(1);
      const tmpOutCampLabel = getPresenceLabel(2);
      const outCampLabel = getPresenceLabel(3);

      return (
        <Input type="select" label="Tila" value={ this.props.currentSelection[property] } onChange={ this.onChange }>
          <option value=""></option>
          <option value="1">{ presenceLabel }</option>
          <option value="2">{ tmpOutCampLabel }</option>
          <option value="3">{ outCampLabel }</option>
        </Input>
      );
    }
  }

  PresenceFilterContainer.propTypes = {
    onChange: React.PropTypes.func.isRequired,
    currentSelection: React.PropTypes.object.isRequired,
  };

  return PresenceFilterContainer;
}
