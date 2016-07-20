import React from 'react';
import { getPropertySelect } from '../../../components';

export function getPropertyFilterContainer(searchFilterStore, searchFilterActions) {
  const PropertySelect = getPropertySelect();

  class PropertyFilterContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState();
      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.extractState = this.extractState.bind(this);
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
      return { options: searchFilterStore.getState().options[this.props.property] || [ ] };
    }

    render() {
      return (
        <PropertySelect
          label={ this.props.label }
          property={ this.props.property }
          value={ this.props.currentSelection[this.props.property] }
          onChange={ this.props.onChange }
          options={ this.state.options }
        />
      );
    }
  }

  PropertyFilterContainer.propTypes = {
    property: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    currentSelection: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return PropertyFilterContainer;
}
