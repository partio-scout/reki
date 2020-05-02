import React from 'react';
import { PropertySelect, PresenceSelector, DebouncedTextField, DateFilter } from '../..';
import { GenericPropertyFilterContainer } from './GenericPropertyFilterContainer';
import { QuickFilterConfiguration, QuickFilterDefinition } from '../ParticipantListPage';
import { AvailableDates, FilterSelection, OptionsByProperty } from '../../../model';

type QuickFilterControlProps = Readonly<{
  filter: QuickFilterDefinition;
  updateFilter: (property: string, newValue: unknown) => void;
  currentSelection: FilterSelection;
  availableDates: AvailableDates;
  optionsByProperty: OptionsByProperty;
}>

const QuickFilterControl: React.FC<QuickFilterControlProps> = ({ filter, updateFilter, currentSelection, availableDates, optionsByProperty }) => {
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

const QuickFilterGroup: React.FC = ({ children }) => <div className="quick-filter-container__group">{ children }</div>;

type QuickFilterContainerProps = Readonly<{
  filter: FilterSelection;
  configuration: QuickFilterConfiguration;
  resetFilter: () => void;
  updateFilter: (property: string, newValue: unknown) => void;
  availableDates: AvailableDates;
  optionsByProperty: OptionsByProperty;
}>
export const QuickFilterContainer: React.FC<QuickFilterContainerProps> = props => {
  const currentSelection = props.filter;

  function handleResetFilter(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
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
};
