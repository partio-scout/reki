import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table, Glyphicon } from 'react-bootstrap';

export class ParticipantDates extends React.Component {
  render() {
    const participantDays = _.sortBy(this.props.dates, 'date');

    if (!_.isEmpty(participantDays)) {
      const firstDay = _.head(participantDays).date;
      const lastDay = _.last(participantDays).date;

      const startOfFirstWeek = moment(firstDay).utc().startOf('week');
      const endOfLastWeek = moment(lastDay).endOf('week');

      const weeks = {};

      for (let d = startOfFirstWeek; d <= endOfLastWeek; d = moment(d).add(1, 'days')) {
        const currentWeekNum = d.format('w');

        if (!weeks[currentWeekNum]) {
          weeks[currentWeekNum] = [];
        }

        weeks[currentWeekNum].push({ date: moment(d), isParticipating: _.find(participantDays, { date: d.startOf('day').toISOString() }) });
      }

      const showDay = day => <td className={ day.isParticipating ? 'active' : 'inactive' }>{ day.date.format('D.M.') }{ day.isParticipating ? <Glyphicon glyph="ok" /> : '' }</td>;
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
      <p>Osallistujalle ei löydy ilmoittautumispäiviä.</p>
    );
  }
}

ParticipantDates.propTypes = {
  dates: React.PropTypes.array.isRequired,
};
