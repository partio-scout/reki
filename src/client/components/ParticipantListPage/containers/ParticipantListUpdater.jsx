import React from 'react';
import _ from 'lodash';

export function getParticipantListUpdater(participantActions) {
  class ParticipantListUpdater extends React.Component {
    reloadList(nextProps, recount) {
      const {
        offset,
        limit,
        order,
        filter,
      } = nextProps;

      participantActions.loadParticipantList(offset, limit, order, filter, recount);
    }

    componentWillMount() {
      this.reloadList(this.props, true);
    }

    componentWillReceiveProps(nextProps) {
      if (!_.isEqual(this.props, nextProps)) {
        const recount = !_.isEqual(this.props.filter, nextProps.filter);

        this.reloadList(nextProps, recount);
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return false;
    }

    render() {
      return null;
    }
  }

  ParticipantListUpdater.propTypes = {
    offset: React.PropTypes.number.isRequired,
    limit: React.PropTypes.number.isRequired,
    order: React.PropTypes.object.isRequired,
    filter: React.PropTypes.object.isRequired,
  };

  return ParticipantListUpdater;
}
