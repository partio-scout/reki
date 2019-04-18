import React from 'react';
import { connect } from 'react-redux';
import { Input } from 'react-bootstrap';
import { getPropertyFilterContainer } from './PropertyFilterContainer';
import _ from 'lodash';
import * as actions from '../../../actions';

export function getGenericPropertyFilterContainer() {
  const PropertyFilterContainer = getPropertyFilterContainer();

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
      this.props.loadOptions();
    }

    render() {
      return (
        <div>
          <Input type="select" className="property-selector" label="Kenttä" value={ this.state.property } onChange={ this.onPropertyChange }>
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

  const mapDispatchToProps = {
    loadOptions: actions.loadOptions,
  };

  return connect(null, mapDispatchToProps)(GenericPropertyFilterContainer);
}
