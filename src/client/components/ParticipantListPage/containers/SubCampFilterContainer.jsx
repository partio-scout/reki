import React from 'react';
import { getPropertySelect } from '../../../components';

export function getSubCampFilterContainer(participantStore, participantActions) {
  const PropertySelect = getPropertySelect();

  class SubCampFilterContainer extends React.Component {
    constructor() {
      super();

      this.state = this.extractState();
      this.onStoreChanced = this.onStoreChanced.bind(this);
    }

    componentWillMount() {
      participantActions.loadSubCamps();
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanced);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChanced);
    }

    extractState() {
      return { options: participantStore.getState().subCamps };
    }

    onStoreChanced() {
      this.setState(this.extractState());
    }

    render() {
      return (
        <PropertySelect
          label="Alaleiri"
          property="subCamp"
          value={ this.props.currentSelection.subCamp }
          onChange={ this.props.onChange }
          options={ this.state.options }
        />
      );
    }
  }

  SubCampFilterContainer.propTypes = {
    currentSelection: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return SubCampFilterContainer;
}

