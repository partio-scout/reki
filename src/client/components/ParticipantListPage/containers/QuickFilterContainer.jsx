import React from 'react';
import _ from 'lodash';
import { Input } from 'react-bootstrap';
import { changeQueryParameters } from './utils';

export function getQuickFilterContainer() {
  const ageGroupSelectionKeys = [
    '',
    'perheleiriläinen',
    'tarpoja',
    'samoaja',
    'vaeltaja',
    'aikuinen',
  ];

  const subCampSelectionKeys = [
    '',
    'humina',
    'hurma',
    'polte',
    'raiku',
    'riehu',
    'syke',
    'unity',
  ];

  function getCurrentSelection(properties, currentFilter) {
    const andSelection = currentFilter.and && _.reduce(currentFilter.and, _.merge, {}) || {};

    const selectionValues = properties.map(propertyName => ({
      [propertyName]: currentFilter[propertyName] || andSelection[propertyName] || '',
    }));
    const currentSelection = _.reduce(selectionValues, _.merge, {});

    return currentSelection;
  }

  function QuickFilterContainer(props, context) {
    const currentSelection = getCurrentSelection(['ageGroup', 'subCamp'], props.filter);

    function getChangeHandler(parameterName) {
      return function(event) {
        const newValue = event.target.value;
        const changedSelection = {
          [parameterName]: newValue,
        };

        const newSelection = _.pickBy(_.merge(currentSelection, changedSelection), (value, key) => value);
        const numberOfFilters = Object.keys(newSelection).length;
        const loopbackFilter = numberOfFilters > 1 ? { and: _.transform(newSelection, (result, value, key) => result.push({ [key]: value }), []) } : newSelection;
        const stringified = numberOfFilters > 0 && JSON.stringify(loopbackFilter);

        context.router.push(changeQueryParameters(props.location, { filter: stringified, offset: 0 }));
      };
    }

    return (
      <div>
        <form className="form-inline">
          <Input type="select" label="Ikäkausi" value={ currentSelection.ageGroup } onChange={ getChangeHandler('ageGroup') }>
            { ageGroupSelectionKeys.map(ageGroup => <option value={ ageGroup } key={ ageGroup }>{ ageGroup }</option>) }
          </Input>
          <Input type="select" label="Alaleiri" value={ currentSelection.subCamp } onChange={ getChangeHandler('subCamp') }>
            { subCampSelectionKeys.map(subCamp => <option value={ subCamp } key={ subCamp }>{ subCamp }</option>) }
          </Input>
        </form>
      </div>
    );
  }

  QuickFilterContainer.propTypes = {
    filter: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  QuickFilterContainer.contextTypes = {
    router: React.PropTypes.object,
  };

  return QuickFilterContainer;
}
