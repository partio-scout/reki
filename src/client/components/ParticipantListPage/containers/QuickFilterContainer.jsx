import React from 'react';
import { Button } from 'react-bootstrap';
import { getPropertyFilterContainer } from './PropertyFilterContainer';
import { getDebouncedTextFieldContainer } from './DebouncedTextFieldContainer';
import { getDateFilterContainer } from './DateFilterContainer';
import { getPresenceFilterContainer } from './PresenceFilterContainer';
import { getGenericPropertyFilterContainer } from './GenericPropertyFilterContainer';

export function getQuickFilterContainer(participantStore, participantActions, searchFilterActions, searchFilterStore) {
  const DebouncedTextFieldContainer = getDebouncedTextFieldContainer();
  const DateFilterContainer = getDateFilterContainer(searchFilterStore, searchFilterActions);
  const PropertyFilterContainer = getPropertyFilterContainer(searchFilterStore, searchFilterActions);
  const PresenceFilterContainer = getPresenceFilterContainer();
  const GenericPropertyFilterContainer = getGenericPropertyFilterContainer(searchFilterStore, searchFilterActions);

  function QuickFilterContainer(props) {
    const currentSelection = props.filter;

    return (
      <div className="well clearfix">
        <form className="form-inline">
          <DebouncedTextFieldContainer
            onChange={ props.updateFilter }
            currentTextValue={ currentSelection.textSearch }
          />
          <PropertyFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
            label="Ikäkausi"
            property="ageGroup"
            className="agegroup-filter"
          />
          <PropertyFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
            label="Alaleiri"
            property="subCamp"
            className="subcamp-filter"
          />
          <PropertyFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
            label="Kylä"
            property="village"
            className="village-filter"
          />
          <PropertyFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
            label="Lippukunta"
            property="localGroup"
            className="local-group-filter"
          />
          <PropertyFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
            label="Leirilippukunta"
            property="campGroup"
            className="camp-group-filter"
          />
          <PresenceFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
          />
          <DateFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
            label="Ilmoittautumispäivät"
            property="dates"
          />
          <GenericPropertyFilterContainer
            onChange={ props.updateFilter }
            currentSelection={ currentSelection }
          />
          <Button type="submit" bsStyle="link" className="top-right" onClick={ props.resetFilter }>Tyhjennä haku</Button>
        </form>
      </div>
    );
  }

  QuickFilterContainer.propTypes = {
    filter: React.PropTypes.object.isRequired,
  };

  return QuickFilterContainer;
}
