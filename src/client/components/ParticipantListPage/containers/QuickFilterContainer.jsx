import React from 'react';
import _ from 'lodash';
import { changeQueryParameters } from './utils';
import { getAgeGroupFilterContainer } from './AgeGroupFilterContainer';
import { getSubCampFilterContainer } from './SubCampFilterContainer';
import { getLocalGroupFilterContainer } from './LocalGroupFilterContainer';

export function getQuickFilterContainer(participantStore, participantActions) {
  const AgeGroupFilterContainer = getAgeGroupFilterContainer();
  const SubCampFilterContainer = getSubCampFilterContainer();
  const LocalGroupFilterContainer = getLocalGroupFilterContainer(participantStore, participantActions);

  function getCurrentSelection(properties, currentFilter) {
    const andSelection = currentFilter.and && _.reduce(currentFilter.and, _.merge, {}) || {};

    const selectionValues = properties.map(propertyName => ({
      [propertyName]: currentFilter[propertyName] || andSelection[propertyName] || '',
    }));
    const currentSelection = _.reduce(selectionValues, _.merge, {});

    return currentSelection;
  }

  function QuickFilterContainer(props, context) {
    const currentSelection = getCurrentSelection(['ageGroup', 'subCamp', 'localGroup'], props.filter);

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
          <AgeGroupFilterContainer onChange={ handleChange } currentSelection={ currentSelection } />
          <SubCampFilterContainer onChange={ handleChange } currentSelection={ currentSelection } />
          <LocalGroupFilterContainer onChange={ handleChange } currentSelection={ currentSelection } />
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
