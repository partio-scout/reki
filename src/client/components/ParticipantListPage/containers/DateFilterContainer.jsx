import React from 'react';
import { getDateFilter } from '../../index';

export function getDateFilterContainer(searchFilterStore, searchFilterActions) {
  const DateFilter = getDateFilter();

  class DateFilterContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState();
      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.extractState = this.extractState.bind(this);
    }

    componentWillMount() {
      searchFilterActions.loadDateOptions.defer(this.props.property);
    }

    componentDidMount() {
      searchFilterStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      searchFilterStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged() {
      this.setState(this.extractState());
    }

    extractState() {
      return { options: searchFilterStore.getState().options[this.props.property] || [] };
    }

    render() {
      return (
        <DateFilter
          label={ this.props.label }
          property={ this.props.property }
          value={ this.props.currentSelection[this.props.property] }
          onChange={ this.props.onChange }
          options={ this.state.options }
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

  return DateFilterContainer;
}
