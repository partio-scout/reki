import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Icon } from '..';
import { ParticipantDetails } from '../../model';

export type ParticipantDatesProps = Readonly<{
  dates: ParticipantDetails['dates'];
}>

const Week: React.FC<{ week: readonly { date: moment.Moment; isParticipating: boolean }[] }> = ({ week }) => (
  <tr>
    { week.map(day => <Day key={ day.date.toString() } day={ day } />) }
    </tr>
);

const Day: React.FC<{ day: { date: moment.Moment; isParticipating: boolean } }> = ({ day }) => {
  const formattedDate = day.date.format('D.M.');
  const icon = day.isParticipating ? <Icon type="ok" /> : null;

  return (
    <td>{ formattedDate }{ icon }</td>
  );
};

export const ParticipantDates: React.FC<ParticipantDatesProps> = props => {
  const participantDays = _.sortBy(props.dates, 'date');

  if (_.isEmpty(participantDays)) {
    return (
      <p>Osallistujalle ei löydy ilmoittautumispäiviä.</p>
    );
  }

  const firstDay = _.head(participantDays)!.date;
  const lastDay = _.last(participantDays)!.date;

  const startOfFirstWeek = moment(firstDay).utc().startOf('week');
  const endOfLastWeek = moment(lastDay).endOf('week');

  const weeks: Record<string, { date: moment.Moment; isParticipating: boolean }[]> = {};

  for (let d = startOfFirstWeek; d <= endOfLastWeek; d = moment(d).add(1, 'days')) {
    const currentWeekNum = d.format('w');

    if (!weeks[currentWeekNum]) {
      weeks[currentWeekNum] = [];
    }

    weeks[currentWeekNum].push({ date: moment(d), isParticipating: _.find(participantDays, { date: d.startOf('day').toISOString() }) !== undefined });
  }

  return (
    <table>
      <tbody>
        { _.map( weeks, (row, weekNumber) => <Week key={ weekNumber } week={ row } /> ) }
      </tbody>
    </table>
  );
};

