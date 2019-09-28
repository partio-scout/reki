import React from 'react';
import { Input } from 'react-bootstrap';
import { getPropertyFilterContainer } from './PropertyFilterContainer';

export function getGenericPropertyFilterContainer(searchFilterStore, searchFilterActions) {
  const PropertyFilterContainer = getPropertyFilterContainer(searchFilterStore, searchFilterActions);

  class GenericPropertyFilterContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        property: '',
      };
      this.onPropertyChange = this.onPropertyChange.bind(this);
    }

    onPropertyChange(e) {
      this.props.onChange(this.state.property, null);
      this.setState({ property: e.target.value });
      searchFilterActions.loadOptions.defer(e.target.value);
    }

    render() {
      return (
        <div>
          <Input type="select" className="property-selector" label="Kenttä" value={ this.state.property } onChange={ this.onPropertyChange }>
            <option value=""></option>
            { this.props.properties.map(({ property, label }, index) => <option value={ property } key={ index }>{ label }</option>) }
          </Input>
          <PropertyFilterContainer
            onChange={ this.props.onChange }
            currentSelection={ this.props.currentSelection }
            label=""
            property={ this.state.property }
          />
        </div>
      );
    }
  }

  GenericPropertyFilterContainer.propTypes = {
    onChange: React.PropTypes.func.isRequired,
    currentSelection: React.PropTypes.object.isRequired,
  };

  return GenericPropertyFilterContainer;
}
