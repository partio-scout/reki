import React from 'react';
import { Button } from 'react-bootstrap';
import _ from 'lodash';
import { getGenericPropertyFilterContainer } from './GenericPropertyFilterContainer';

export function getPrintButtonContainer(searchFilterStore, searchFilterActions) {
  const GenericPropertyFilterContainer = getGenericPropertyFilterContainer(searchFilterStore, searchFilterActions);
  class PrintButtonContainer extends React.Component {
    constructor(props) {
      super(props);
      this.props = props;
      this.loadCSV = this.loadCSV.bind(this);
      this.showFile = this.showFile.bind(this);
    }

    loadCSV() {
      const propertiesForGenericFilter = GenericPropertyFilterContainer.availableProperties();
      const properties = ['textSearch', 'ageGroup', 'subCamp', 'localGroup', 'campGroup', 'presence', 'village', 'dates'].concat(propertiesForGenericFilter);
      const andSelection = this.props.filter.and && _.reduce(this.props.filter.and, _.merge, {}) || {};

      const selectionValues = properties.map(propertyName => ({
        [propertyName]: this.props.filter[propertyName] || andSelection[propertyName] || '',
      }));

      const selectionValuesObj = selectionValues.reduce((result, item) => {
        const key = Object.keys(item)[0]; //first property: a, b, c
        result[key] = item[key];
        return result;
      }, {});
      Object.keys(selectionValuesObj).forEach(key => (selectionValuesObj[key] == '') && delete selectionValuesObj[key]);
      const filters = {
        where: selectionValuesObj,
        skip: 0,
        limit: 200,
        include: ['dates'],
      };

      const filterString = `filter=${encodeURIComponent(JSON.stringify(filters))}`;

      // fetch('/printing/?filter={%22where%22%3A{%22subCamp%22%3A%22Muu%22}%2C%22skip%22%3A0%2C%22limit%22%3A200%2C%22include%22%3A[%22dates%22]}')
      fetch('/printing/?' + filterString)
        .then(r => r.blob())
        .then(this.showFile);
    }

    showFile(blob) {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const newBlob = new Blob([blob], { type: 'text/plain' });

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }

      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      const data = window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = data;
      link.download = 'print.csv';
      link.click();
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
      }
      , 100);
    }

    render() {
      return (
        <div>
          <Button className="pull-right" bsStyle="primary" onClick={ this.loadCSV }>
            Lataa CSV
          </Button>
        </div>
      );
    }
  }

  PrintButtonContainer.propTypes = {
    filter: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  return PrintButtonContainer;
}
