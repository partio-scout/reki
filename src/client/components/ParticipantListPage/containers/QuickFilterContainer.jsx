import React from 'react';
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import { changeQueryParameters } from '../../../utils';
import { getPropertyFilterContainer } from './PropertyFilterContainer';
import { getDebouncedTextFieldContainer } from './DebouncedTextFieldContainer';
import { getDateFilterContainer } from './DateFilterContainer';
import { getPresenceFilterContainer } from './PresenceFilterContainer';
import { getSaveSearchButtonContainer } from './SaveSearchButtonContainer';
import { getGenericPropertyFilterContainer } from './GenericPropertyFilterContainer';

export function getQuickFilterContainer(participantStore, participantActions, searchFilterActions, searchFilterStore) {
  const DebouncedTextFieldContainer = getDebouncedTextFieldContainer();
  const DateFilterContainer = getDateFilterContainer(searchFilterStore, searchFilterActions);
  const SaveSearchButtonContainer = getSaveSearchButtonContainer(searchFilterActions);
  const PropertyFilterContainer = getPropertyFilterContainer(searchFilterStore, searchFilterActions);
  const PresenceFilterContainer = getPresenceFilterContainer();
  const GenericPropertyFilterContainer = getGenericPropertyFilterContainer(searchFilterStore, searchFilterActions);

  function getCurrentSelection(properties, currentFilter) {
    const andSelection = currentFilter.and && _.reduce(currentFilter.and, _.merge, {}) || {};

    const selectionValues = properties.map(propertyName => ({
      [propertyName]: currentFilter[propertyName] || andSelection[propertyName] || '',
    }));
    const currentSelection = _.reduce(selectionValues, _.merge, {});

    return currentSelection;
  }

  function QuickFilterContainer(props, context) {
    const propertiesForGenericFilter = GenericPropertyFilterContainer.availableProperties();
    const properties = ['textSearch', 'ageGroup', 'subCamp', 'localGroup', 'campGroup', 'presence', 'village', 'dates'].concat(propertiesForGenericFilter);

    const currentSelection = getCurrentSelection(properties, props.filter);

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
            className="agegroup-filter"
          />
          <PropertyFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
            label="Alaleiri"
            property="subCamp"
            className="subcamp-filter"
          />
          <PropertyFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
            label="Kylä"
            property="village"
            className="village-filter"
          />
          <PropertyFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
            label="Lippukunta"
            property="localGroup"
            className="local-group-filter"
          />
          <PropertyFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
            label="Leirilippukunta"
            property="campGroup"
            className="camp-group-filter"
          />
          <PresenceFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
          />
          <DateFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
            label="Ilmoittautumispäivät"
            property="dates"
          />
          <GenericPropertyFilterContainer
            onChange={ handleChange }
            currentSelection={ currentSelection }
          />
          <Button type="submit" bsStyle="link" className="top-right" onClick={ resetFilters }>Tyhjennä haku</Button>
          <SaveSearchButtonContainer location={ props.location } />
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
