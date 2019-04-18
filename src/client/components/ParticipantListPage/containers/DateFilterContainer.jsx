import React from 'react';
import { connect } from 'react-redux';
import { getDateFilter } from '../../index';
import { createStateMapper } from '../../../redux-helpers';
import * as actions from '../../../actions';

export function getDateFilterContainer() {
  const DateFilter = getDateFilter();

  class DateFilterContainer extends React.Component {
    constructor(props) {
      super(props);
    }

    componentWillMount() {
      this.props.loadDateOptions(this.props.property);
    }

    render() {
      return (
        <DateFilter
          label={ this.props.label }
          property={ this.props.property }
          value={ this.props.currentSelection[this.props.property] }
          onChange={ this.props.onChange }
          options={ this.props.options }
        />
      );
    }
  }

  DateFilterContainer.propTypes = {
    property: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    currentSelection: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  const mapStateToProps = createStateMapper({
    options: state => state.searchFilters.dates,
  });

  const mapDispatchToProps = {
    loadDateOptions: actions.loadDateOptions,
  };

  return connect(mapStateToProps, mapDispatchToProps)(DateFilterContainer);
}
