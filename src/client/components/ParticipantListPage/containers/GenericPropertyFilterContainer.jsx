import React from 'react';
import { Input } from 'react-bootstrap';
import { getPropertyFilterContainer } from './PropertyFilterContainer';
import _ from 'lodash';

export function getGenericPropertyFilterContainer(searchFilterStore, searchFilterActions) {
  const PropertyFilterContainer = getPropertyFilterContainer(searchFilterStore, searchFilterActions);

  const properties = [
    { childNaps: 'Lapsi nukkuu päiväunet' },
    { accommodation: 'Majoittautuminen' },
    { country: 'Maa' },
    { willOfTheWisp: 'Virvatuli' },
    { willOfTheWispWave: 'Virvatulen aalto' },
    { internationalGuest: 'KV-osallistuja' },
  ];

  class GenericPropertyFilterContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        property: '',
      };
      this.onPropertyChange = this.onPropertyChange.bind(this);
    }

    static availableProperties() {
      return properties.map(p => _.keys(p)[0]);
    }

    onPropertyChange(e) {
      this.props.onChange(this.state.property, null);
      this.setState({ property: e.target.value });
      searchFilterActions.loadOptions.defer(e.target.value);
    }

    render() {
      return (
        <div>
          <Input type="select" label="Kenttä" value={ this.state.property } onChange={ this.onPropertyChange }>
            <option value=""></option>
            { properties.map((property, index) => <option value={ _.keys(property)[0] } key={ index }>{ _.values(property)[0] }</option>) }
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
