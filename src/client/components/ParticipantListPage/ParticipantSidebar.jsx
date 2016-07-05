import React from 'react';
import { Link } from 'react-router';
import { Button, Glyphicon } from 'react-bootstrap';

class SearchFilterListItem extends React.Component {
  constructor() {
    super();
    this.remove = this.remove.bind(this);
  }

  remove() {
    this.props.remove(this.props.searchFilter.id);
  }

  render() {
    const {
      name,
      filter,
    } = this.props.searchFilter;

    return (
      <li>
        <Link to={ `/participants/${filter}` }>{ name }</Link>
        <Button bsStyle="link" onClick={ this.remove } >
          <Glyphicon glyph="remove" />
        </Button>
      </li>
    );
  }
}

SearchFilterListItem.propTypes = {
  searchFilter: React.PropTypes.object.isRequired,
  remove: React.PropTypes.func,
};

export function getParticipantSidebar(searchFilterStore, searchFilterActions) {
  function removeSearchFilter(id) {
    searchFilterActions.deleteSearchFilter(id);
  }

  class ParticipantSidebar extends React.Component {
    constructor(props) {
      super(props);
      this.state = searchFilterStore.getState();
    }

    componentWillMount() {
      searchFilterActions.loadSearchFilterList();
    }

    componentDidMount() {
      searchFilterStore.listen(this.onSearchFilterStoreChange.bind(this));
    }

    componentWillUnMount() {
      searchFilterStore.unlisten(this.onSearchFilterStoreChange.bind(this));
    }

    onSearchFilterStoreChange(state) {
      this.setState(state);
    }

    render() {
      const createListItem = element => (
        <SearchFilterListItem
          key={ element.id }
          searchFilter={ element }
          remove={ removeSearchFilter }
        />
      );

      return (
        <div>
          <strong>Tallennetut haut</strong>
          <ul className="sidebar-list">
            {
              this.state.searchFilters.map(createListItem)
            }
          </ul>
        </div>
      );
    }
  }

  return ParticipantSidebar;
}
