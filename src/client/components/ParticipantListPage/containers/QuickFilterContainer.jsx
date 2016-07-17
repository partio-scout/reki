import React from 'react';
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import { changeQueryParameters } from '../../../utils';
import { getPropertyFilterContainer } from './PropertyFilterContainer';
import { getDebouncedTextFieldContainer } from './DebouncedTextFieldContainer';
import { getPresenceFilterContainer } from './PresenceFilterContainer';
import { getSaveSearchButtonContainer } from './SaveSearchButtonContainer';

export function getQuickFilterContainer(participantStore, participantActions, searchFilterActions, searchFilterStore) {
  const DebouncedTextFieldContainer = getDebouncedTextFieldContainer();
  const SaveSearchButtonContainer = getSaveSearchButtonContainer(searchFilterActions);
  const PropertyFilterContainer = getPropertyFilterContainer(searchFilterStore, searchFilterActions);
  const PresenceFilterContainer = getPresenceFilterContainer();

  function getCurrentSelection(properties, currentFilter) {
    const andSelection = currentFilter.and && _.reduce(currentFilter.and, _.merge, {}) || {};

    const selectionValues = properties.map(propertyName => ({
      [propertyName]: currentFilter[propertyName] || andSelection[propertyName] || '',
    }));
    const currentSelection = _.reduce(selectionValues, _.merge, {});

    return currentSelection;
  }

  function QuickFilterContainer(props, context) {
    const currentSelection = getCurrentSelection(['textSearch', 'ageGroup', 'subCamp', 'localGroup', 'campGroup', 'presence', 'village'], props.filter);

    function resetFilters(event) {
      event.preventDefault();
      context.router.push(changeQueryParameters(props.location, { filter: '', offset: 0 }));
    }

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
      <div className="well clearfix">
        <div>
          <form className="form-inline">
            <DebouncedTextFieldContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
            />
            <PropertyFilterContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
              label="Ikäkausi"
              property="ageGroup"
            />
            <PropertyFilterContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
              label="Alaleiri"
              property="subCamp"
            />
            <PropertyFilterContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
              label="Kylä"
              property="village"
            />
            <PropertyFilterContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
              label="Lippukunta"
              property="localGroup"
            />
            <PropertyFilterContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
              label="Leirilippukunta"
              property="campGroup"
            />
            <PresenceFilterContainer
              onChange={ handleChange }
              currentSelection={ currentSelection }
            />
            <SaveSearchButtonContainer location={ props.location } />
          </form>
        </div>
        <div>
          <Button type="submit" bsStyle="primary" onClick={ resetFilters }>Nollaa haku</Button>
        </div>
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
