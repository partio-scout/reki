import React from 'react';
import _ from 'lodash';
import moment from 'moment';

moment.locale('fi');

export class ParticipantDates extends React.Component {
  render() {

    const dates = _.sortBy(this.props.dates, 'date');

    return (
      <ul>
        { dates.map( row => <li>{ moment(row.date).format('L') }</li> ) }
      </ul>
    );
  }
}

ParticipantDates.propTypes = {
  dates: React.PropTypes.array.isRequired,
};
