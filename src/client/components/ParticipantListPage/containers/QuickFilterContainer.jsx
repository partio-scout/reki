import React from 'react';
import _ from 'lodash';
import { getPropertySelect } from '../../../components';
import { changeQueryParameters } from './utils';

export function getQuickFilterContainer() {
  const PropertySelect = getPropertySelect();

  const filterableProperties = {
    ageGroup: {
      label: 'Ikäkausi',
      options: [
        '',
        'perheleiriläinen',
        'tarpoja',
        'samoaja',
        'vaeltaja',
        'aikuinen',
      ],
    },
    subCamp: {
      label: 'Alaleiri',
      options: [
        '',
        'humina',
        'hurma',
        'polte',
        'raiku',
        'riehu',
        'syke',
        'unity',
      ],
    },
  };

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

    function handleChange(parameterName, newValue) {
      const changedSelection = {
        [parameterName]: newValue,
      };

      const newSelection = _.pickBy(_.merge(currentSelection, changedSelection), (value, key) => value);
      const numberOfFilters = Object.keys(newSelection).length;
      const loopbackFilter = numberOfFilters > 1 ? { and: _.transform(newSelection, (result, value, key) => result.push({ [key]: value }), []) } : newSelection;
      const stringified = numberOfFilters > 0 && JSON.stringify(loopbackFilter);

      context.router.push(changeQueryParameters(props.location, { filter: stringified, offset: 0 }));
    }

    return (
      <div>
        <form className="form-inline">
          {
            Object.keys(filterableProperties).map(propertyName => {
              const propertyDefs = filterableProperties[propertyName];
              return (
                <PropertySelect
                  key={ propertyName }
                  label={ propertyDefs.label }
                  property={ propertyName }
                  value={ currentSelection[propertyName] }
                  onChange={ handleChange }
                  options={ propertyDefs.options }
                />
              );
            })
          }
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
