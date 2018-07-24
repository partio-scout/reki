//import { models } from '../models';

import { Op } from 'sequelize';
import _ from 'lodash';
import { models } from '../models';
import config from '../conf';

export default function(app) {
  const cleanNull = input => input ? input : '';

  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
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
    const filterOrder = req.query.order ? JSON.parse(req.query.order) : null;
    const order = filterOrder ? Object.keys(filterOrder).map(key => [ key, filterOrder[key] ] ) : [['ageGroup', 'ASC' ], [ 'lastName', 'ASC' ], [ 'firstName', 'ASC' ]];
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
    if (req.query.printFormat && req.query.printFormat === 'xlsx') {
      // print XLSX
      const xl = require('excel4node');
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet('Participants');
      const boldStyle = wb.createStyle({
        font: {
          bold: true,
        },
      });
      const fitStyle = wb.createStyle({
        alignment: {
          shrinkToFit: true,
        },
      });
      ws.cell(1, 1).string('Jäsennro').style(boldStyle);
      ws.cell(1, 2).string('Sukunimi').style(boldStyle);
      ws.cell(1, 3).string('Etunimi').style(boldStyle);
      ws.cell(1, 4).string('Syntymäpv').style(boldStyle);
      ws.cell(1, 5).string('Ikäkausi').style(boldStyle);
      ws.cell(1, 6).string('Leiritoimiston merkinnät').style(boldStyle);
      ws.cell(1, 7).string('Lisätiedot').style(boldStyle);
      ws.cell(1, 8).string('Partiolainen?').style(boldStyle);
      ws.cell(1, 9).string('Puhelinnumero').style(boldStyle);
      ws.cell(1, 10).string('Majoittuminen').style(boldStyle);
      ws.cell(1, 11).string('Lippukunta').style(boldStyle);
      ws.cell(1, 12).string('Kylä').style(boldStyle);
      ws.cell(1, 13).string('Alaleiri').style(boldStyle);
      ws.cell(1, 14).string('Leirilippukunta').style(boldStyle);
      ws.cell(1, 15).string('Ilmoittautumispäivät').style(boldStyle);
      ws.row(1).freeze();
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
        ws.cell(i + 2, 1).string(cleanNull(result.rows[i].memberNumber));
        ws.cell(i + 2, 2).string(cleanNull(result.rows[i].lastName));
        ws.cell(i + 2, 3).string(cleanNull(result.rows[i].firstName));
        ws.cell(i + 2, 4).string(formatDate(result.rows[i].dateOfBirth));
        ws.cell(i + 2, 5).string(cleanNull(result.rows[i].ageGroup));
        ws.cell(i + 2, 6).string(cleanNull(result.rows[i].campOfficeNotes));
        ws.cell(i + 2, 7).string(cleanNull(result.rows[i].editableInfo));
        ws.cell(i + 2, 8).string(result.rows[i].nonScout ? 'ei' : 'partiolainen');
        ws.cell(i + 2, 9).string(phoneNumber).style(fitStyle);
        ws.cell(i + 2, 10).string(result.rows[i].accommodation);
        ws.cell(i + 2, 11).string(result.rows[i].localGroup);
        let village = result.rows[i].village;
        if (village.indexOf('/') > -1) {
          village = village.substring(village.indexOf('/') + 2)
        }
        ws.cell(i + 2, 12).string(village);
        ws.cell(i + 2, 13).string(result.rows[i].subCamp);
        ws.cell(i + 2, 14).string(result.rows[i].campGroup);
        ws.cell(i + 2, 15).string(dateDescription);
      }
      ws.column(1).setWidth(9);
      ws.column(2).setWidth(20);
      ws.column(3).setWidth(15);
      ws.column(9).setWidth(15);
      ws.column(10).setWidth(14);
      ws.column(11).setWidth(20);
      ws.column(12).setWidth(8);
      ws.column(14).setWidth(20);
      ws.column(15).setWidth(40);
      wb.write('reki-print.xlsx', res);
    } else {
      // print CSV
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
    }
  }));

}
