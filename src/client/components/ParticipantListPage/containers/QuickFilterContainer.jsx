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

  const configuration = {
    filters: [
      { type: 'debouncedTextField', property: 'textSearch', label: 'Tekstihaku' },
      { type: 'options', property: 'ageGroup', label: 'Ikäkausi' },
      { type: 'options', property: 'subCamp', label: 'Alaleiri' },
      { type: 'options', property: 'village', label: 'Kylä' },
      { type: 'options', property: 'localGroup', label: 'Lippukunta' },
      { type: 'options', property: 'campGroup', label: 'Leirilippukunta' },
      { type: 'presence', label: 'Tila' },
      { type: 'availableDates', label: 'Ilmoittautumispäivät' },
      { type: 'generic', label: 'Kenttä', properties: [
          { property: 'childNaps', label: 'Lapsi nukkuu päiväunet' },
          { property: 'accommodation', label: 'Majoittautuminen' },
          { property: 'country', label: 'Maa' },
          { property: 'willOfTheWisp', label: 'Virvatuli' },
          { property: 'willOfTheWispWave', label: 'Virvatulen aalto' },
          { property: 'internationalGuest', label: 'KV-osallistuja' },
      ] },
    ],
  };

  function QuickFilterContainer(props) {
    const currentSelection = props.filter;

    return (
      <div className="well clearfix">
        <form className="form-inline">
          { configuration.filters.map(filter => {
            switch (filter.type) {
              case 'debouncedTextField':
                return (
                  <DebouncedTextFieldContainer
                    onChange={ props.updateFilter }
                    currentSelection={ currentSelection }
                    label={ filter.label }
                    property="textSearch"
                  />
                );
              case 'options':
                return (
                  <PropertyFilterContainer
                    onChange={ props.updateFilter }
                    currentSelection={ currentSelection }
                    label={ filter.label }
                    property={ filter.property }
                  />
                );
              case 'presence':
                return (
                  <PresenceFilterContainer
                    onChange={ props.updateFilter }
                    currentSelection={ currentSelection }
                    label={ filter.label }
                  />
                );
              case 'availableDates':
                return (
                  <DateFilterContainer
                    onChange={ props.updateFilter }
                    currentSelection={ currentSelection }
                    label={ filter.label }
                    property="dates"
                  />
                );
              case 'generic':
                return (
                  <GenericPropertyFilterContainer
                    onChange={ props.updateFilter }
                    currentSelection={ currentSelection }
                    label={ filter.label }
                    properties={ filter.properties }
                  />
                );
              default:
                return null;
            }
          }) }
          <Button bsStyle="link" className="top-right" onClick={ props.resetFilter }>Tyhjennä haku</Button>
        </form>
      </div>
    );
  }

  QuickFilterContainer.propTypes = {
    filter: React.PropTypes.object.isRequired,
  };

  return QuickFilterContainer;
}
