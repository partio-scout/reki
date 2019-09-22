import React from 'react';
import { PropertySelect, PresenceSelector, DebouncedTextField, DateFilter } from '../..';
import { GenericPropertyFilterContainer } from './GenericPropertyFilterContainer';

const QuickFilterControl = ({ filter, updateFilter, currentSelection, availableDates, optionsByProperty }) => {
  switch (filter.type) {
    case 'debouncedTextField':
      return (
        <DebouncedTextField
          key={ filter.label }
          onChange={ updateFilter }
          currentSelection={ currentSelection }
          label={ filter.label }
          property="textSearch"
        />
      );
    case 'options':
      return (
        <PropertySelect
          key={ filter.label }
          onChange={ updateFilter }
          currentSelection={ currentSelection }
          label={ filter.label }
          property={ filter.property }
          optionsByProperty={ optionsByProperty }
        />
      );
    case 'presence':
      return (
        <PresenceSelector
          key={ filter.label }
          onChange={ updateFilter }
          currentSelection={ currentSelection }
          label={ filter.label }
          property="presence"
        />
      );
    case 'availableDates':
      return (
        <DateFilter
          key={ filter.label }
          onChange={ updateFilter }
          currentSelection={ currentSelection }
          label={ filter.label }
          property="dates"
          availableDates={ availableDates }
        />
      );
    case 'generic':
      return (
        <GenericPropertyFilterContainer
          key={ filter.label }
          onChange={ updateFilter }
          currentSelection={ currentSelection }
          label={ filter.label }
          properties={ filter.properties }
          optionsByProperty={ optionsByProperty }
        />
      );
    default:
      return null;
  }
};

const QuickFilterGroup = ({ children }) => <div className="quick-filter-container__group">{ children }</div>;

export function QuickFilterContainer(props) {
  const currentSelection = props.filter;

  function handleResetFilter(event) {
    event.preventDefault();
    props.resetFilter();
  }

  return (
    <form className="quick-filter-container">
      { props.configuration.filters.map((group, i) => <QuickFilterGroup key={ i }>{group.map(filter => <QuickFilterControl key={ filter.label } filter={ filter } currentSelection={ currentSelection } updateFilter={ props.updateFilter } availableDates={ props.availableDates } optionsByProperty={ props.optionsByProperty } />) }</QuickFilterGroup>) }
      <div className="quick-filter-container__button-container">
        <button onClick={ handleResetFilter }>Tyhjennä haku</button>
      </div>
    </form>
  );
}
