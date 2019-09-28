import React from 'react';
import { PresenceSelector } from '../../../components';

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
      return (
        <PresenceSelector label={ this.props.label } onChange={ this.onChange } value={ this.props.currentSelection[property] || '' }/>
      );
    }
  }

  PresenceFilterContainer.propTypes = {
    onChange: React.PropTypes.func.isRequired,
    currentSelection: React.PropTypes.object.isRequired,
  };

  return PresenceFilterContainer;
}
