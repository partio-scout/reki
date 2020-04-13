import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Icon } from '..';

export function ParticipantDates (props) {
  const participantDays = _.sortBy(props.dates, 'date');

  if (_.isEmpty(participantDays)) {
    return (
      <p>Osallistujalle ei löydy ilmoittautumispäiviä.</p>
    );
  }

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

  return (
    <table>
      <tbody>
        { _.map( weeks, (row, weekNumber) => <Week key={ weekNumber } week={ row } /> ) }
      </tbody>
    </table>
  );
}

function Week({ week }) {
  return (
    <tr>
      { week.map(day => <Day key={ day.date.toString() } day={ day } />) }
      </tr>
  );
}

function Day({ day }) {
  const formattedDate = day.date.format('D.M.');
  const icon = day.isParticipating ? <Icon type="ok" /> : null;

  return (
    <td>{ formattedDate }{ icon }</td>
  );
}
