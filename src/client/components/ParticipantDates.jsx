import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table, Glyphicon } from 'react-bootstrap';

moment.locale('fi');

export class ParticipantDates extends React.Component {
  render() {
    const participantDays = _.sortBy(this.props.dates, 'date');

    if (!_.isEmpty(participantDays)) {
      const firstDay = _.head(participantDays).date;
      const lastDay = _.last(participantDays).date;

      const weeks = {};

      for (let d = moment(firstDay).utc().startOf('week'); d <= moment(lastDay).endOf('week'); d = moment(d).add(1, 'days')) {
        if (!weeks[d.format('w')]) {
          weeks[d.format('w')] = [];
        }
        weeks[d.format('w')].push({ date: moment(d), participant: _.find(participantDays, { date: d.startOf('day').toISOString() }) });
      }

      const showDay = day => <td className={ day.participant ? 'active' : 'inactive' }>{ day.date.format('D.M.') }{ day.participant ? <Glyphicon glyph="ok" /> : '' }</td>;
      const showWeek = week => <tr>{ week.map(day => showDay(day)) }</tr>;

      return (
        <Table className="participant-dates">
          <tbody>
            { _.map( weeks, row => showWeek(row) ) }
          </tbody>
        </Table>
      );
    }

    return (
      <div></div>
    );
  }
}

ParticipantDates.propTypes = {
  dates: React.PropTypes.array.isRequired,
};
