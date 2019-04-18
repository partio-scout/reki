import React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { getPropertySelect } from '../../../components';

export function getPropertyFilterContainer() {
  const PropertySelect = getPropertySelect();

  function PropertyFilterContainer(props) {
    return (
      <PropertySelect
        label={ props.label }
        property={ props.property }
        value={ props.currentSelection[props.property] }
        onChange={ props.onChange }
        options={ props.options }
        className={ props.className }
      />
    );
  }

  PropertyFilterContainer.propTypes = {
    property: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    currentSelection: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
  };

  const mapStateToProps = (state, ownProps) => ({
    options: _.sortBy(state.searchFilters.options[ownProps.property] || []),
  });

  return connect(mapStateToProps)(PropertyFilterContainer);
}
