import React from 'react';
import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { Button, Glyphicon } from 'react-bootstrap';
import * as actions from '../../actions';
import * as navigationActions from '../../navigation/actions';
import { createStateMapper } from '../../redux-helpers';

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

    const unwrappedFilter = {};
    const params = new URLSearchParams(filter);
    for (const x of params) {
      unwrappedFilter[x[0]] = x[1];
    }

    return (
      <li>
        <Link to={ navigationActions.navigateToParticipantsList({ query: unwrappedFilter }) }>{ name }</Link>
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

export function getParticipantSidebar() {
  class ParticipantSidebar extends React.Component {
    constructor(props) {
      super(props);
    }

    componentWillMount() {
      this.props.loadSearchFilterList();
    }

    removeSearchFilter(id) {
      this.props.deleteSearchFilter(id);
    }

    render() {
      const createListItem = element => (
        <SearchFilterListItem
          key={ element.id }
          searchFilter={ element }
          remove={ id => this.removeSearchFilter(id) }
        />
      );

      return (
        <div>
          <strong>Tallennetut haut</strong>
          <ul className="sidebar-list">
            {
              this.props.searchFilters.map(createListItem)
            }
          </ul>
        </div>
      );
    }
  }

  const mapStateToProps = createStateMapper({
    searchFilters: state => state.searchFilters.searchFilters,
  });

  const mapDispatchToProps = {
    loadSearchFilterList: actions.loadSearchFilterList,
    deleteSearchFilter: actions.deleteSearchFilter,
  };

  return connect(mapStateToProps, mapDispatchToProps)(ParticipantSidebar);
}
