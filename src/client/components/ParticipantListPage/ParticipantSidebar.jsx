import React from 'react';
import { Link } from 'react-router';

class SearchFilterListItem extends React.Component {
  render() {
    const {
      name,
      filter,
    } = this.props.searchFilter;

    return (
      <li>
        <Link to={ `participants/${filter}` }>{ name }</Link>
      </li>
    );
  }
}

SearchFilterListItem.propTypes = {
  searchFilter: React.PropTypes.object.isRequired,
};

export function getParticipantSidebar(participantStore, participantActions) {
  class ParticipantSidebar extends React.Component {
    constructor(props) {
      super(props);
      this.state = participantStore.getState();
    }

    componentWillMount() {
      participantActions.loadSearchFilterList();
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnMount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      this.setState(state);
    }
    render() {
      const createListItem = element => (
        <SearchFilterListItem key={ element.id } searchFilter={ element }/>
      );

      return (
        <ul className="sidebar-list">
          {
            this.state.searchFilters.map(createListItem)
          }
        </ul>
      );
    }
  }

  return ParticipantSidebar;
}
