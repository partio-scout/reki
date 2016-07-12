import React from 'react';
import { getPropertySelect } from '../../../components';

export function getCampGroupFilterContainer(participantStore, participantActions) {
  const PropertySelect = getPropertySelect();

  class CampGroupFilterContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState();
      this.onStoreChanged = this.onStoreChanged.bind(this);
    }

    componentWillMount() {
      participantActions.loadCampGroups.defer();
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged() {
      this.setState(this.extractState());
    }

    extractState() {
      return { options: participantStore.getState().campGroups };
    }

    render() {
      return (
        <PropertySelect
          label="Leirilippukunta"
          property="campGroup"
          value={ this.props.currentSelection.campGroup }
          onChange={ this.props.onChange }
          options={ this.state.options }
        />
      );
    }
  }

  CampGroupFilterContainer.propTypes = {
    currentSelection: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
  };

  return CampGroupFilterContainer;
}
