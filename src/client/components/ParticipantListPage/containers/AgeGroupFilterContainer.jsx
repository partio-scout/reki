import React from 'react';
import { getPropertySelect } from '../../../components';

export function getAgeGroupFilterContainer(participantStore, participantActions) {
  const PropertySelect = getPropertySelect();

  class AgeGroupFilterContainer extends React.Component {
    constructor() {
      super();

      this.state = this.extractState();
      this.onStoreChanced = this.onStoreChanced.bind(this);
    }

    componentWillMount() {
      participantActions.loadAgeGroups();
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanced);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChanced);
    }

    extractState() {
      return { options: participantStore.getState().ageGroups };
    }

    onStoreChanced() {
      this.setState(this.extractState());
    }
    render() {
      return (
        <PropertySelect
          label="Ikäkausi"
          property="ageGroup"
          value={ this.props.currentSelection.ageGroup }
          onChange={ this.props.onChange }
          options={ this.state.options }
        />
      );
    }
  }

  AgeGroupFilterContainer.propTypes = {
    currentSelection: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return AgeGroupFilterContainer;
}
