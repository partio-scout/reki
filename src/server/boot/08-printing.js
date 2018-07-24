//import { models } from '../models';

import { Op } from 'sequelize';
import _ from 'lodash';
import { models } from '../models';
import config from '../conf';

export default function(app) {
  const cleanNull = input => input ? input : '';

  const formatDate = dateString => {
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}\t`;
  };

  const formatParticipationDate = dateString => {
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.`;
  };

  app.get('/printing', app.requirePermission('view participants'), app.wrap(async (req, res) => {
    const filter = JSON.parse(req.query.filter || '{}');
    const limit = +filter.limit || undefined;
    const offset = +filter.skip || undefined;
    // TODO refactor so this comes in right format already
    const filterOrder = req.query.order ? JSON.parse(req.query.order) : null;
    const order = filterOrder ? Object.keys(filterOrder).map(key => [ key, filterOrder[key] ] ) : [['ageGroup', 'ASC' ], [ 'lastName', 'ASC' ], [ 'firstName', 'ASC' ]];
console.dir(order)
    let where = filter.where || {};

    // TODO refactor this out: it's silly to have an and-array coming from frontend :)
    // More than one condition is represented as array for leagacy reasons -> move back to object
    if (where.and) {
      where = _.reduce(where.and, (cond, acc) => Object.assign(acc, cond), {});
    }

    // For free-text searching we need to add ILIKE filter for all searchable text fields
    if (where.textSearch) {
      const words = where.textSearch.split(/\s+/);
      // Why or statement inside an and statement? Because we want to every word in textSearch
      // to match at least once, but possibly match in different fields. For example "Firstname Lastname"
      // should match "Firstname" in first name and "Lastname" in last name.
      where[Op.and] = words.map(word => {
        const searches = config.getSearchableFieldNames().map(field => ({
          [field]: {
            [Op.iLike]: `%${word}%`,
          },
        }));
        return { [Op.or]: searches };
      });

      delete where.textSearch; // textSearch is not a real field -> remove, or Sequelize would throw error
    }

    // Date search
    let dateFilter;
    if (where.dates && where.dates.length && where.dates.length > 0) {
      dateFilter = {
        date: {
          [Op.in]: _.map(where.dates, dateStr => new Date(dateStr)),
        },
      };
    }
    delete where.dates;

    const result = await models.Participant.findAndCount( {
      where: where,
      include: [
        // Filter results using datesearch
        {
          model: models.ParticipantDate,
          as: 'datesearch',
          where: dateFilter,
        },
        // Get all dates of participant
        {
          model: models.ParticipantDate,
          as: 'dates',
        },
      ],
      offset: offset,
      limit: limit,
      order: order,
      distinct: true, // without this count is calculated incorrectly
    });

    res.statusCode = 200;
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.charset = 'utf-8';
    let csvResult = '\uFEFF';
    csvResult += 'Jäsennumero;Sukunimi;Etunimi;Syntymäpäivä;Ikäkausi;Leiritoimiston merkinnät;Lisätiedot;Partiolainen?;Puhelinnumero;Majoittuminen;Lippukunta;Kylä;Alaleiri;Leirilippukunta;Ilmoittautumispäivät\n';
    for (let i = 0; i < result.rows.length; i++) {
      const phoneNumber = result.rows[i].phoneNumber ? result.rows[i].phoneNumber : 'ei tietoa';
      // sort dates
      const dates = result.rows[i].dates;
      dates.sort((date1, date2) => {
        if (date1.dataValues.date > date2.dataValues.date) {
          return 1;
        }
        if (date1.dataValues.date < date2.dataValues.date) {
          return -1;
        }
        return 0;
      });
      let dateDescription = '';
      for (let i = 0; i < dates.length; i++) {
        dateDescription += formatParticipationDate(dates[i].dataValues.date);
        if (i !== dates.length - 1) {
          dateDescription += ' ';
        }
      }
      dateDescription += '\t';
      csvResult += `${cleanNull(result.rows[i].memberNumber)};${result.rows[i].lastName};${result.rows[i].firstName};${formatDate(result.rows[i].dateOfBirth)};${cleanNull(result.rows[i].ageGroup)};${cleanNull(result.rows[i].campOfficeNotes)};${cleanNull(result.rows[i].editableInfo)};${result.rows[i].nonScout ? 'ei' : 'partiolainen'};${phoneNumber}\t;${result.rows[i].accommodation};${result.rows[i].localGroup};${result.rows[i].village};${result.rows[i].subCamp};${result.rows[i].campGroup};${dateDescription}\n`;
    }
    res.write(csvResult);
    res.end();
  }));

}
