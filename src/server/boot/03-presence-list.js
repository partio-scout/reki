import { _ } from 'lodash';
import { models, sequelize } from '../models';
import Sequelize from 'sequelize';

const subCamps = ['Gloria', 'Triton', 'Ra', 'Cyber'];

export default function(app) {
  app.get('/paikalla', async (req, res, next) => {
    try {
      const totalCount = await models.Participant.count({ where: { presence: 3 } });
      const temporarilyAway = await models.Participant.count({ where: { presence: 2 } });
      const rows = await sequelize.query(`SELECT "subCamp","ageGroup", COUNT(*) FROM participants WHERE presence='3' GROUP BY "subCamp", "ageGroup";`, { type: Sequelize.QueryTypes.SELECT });
      const bySubCamp = _.groupBy(rows, row => row.subCamp);
      const subCampNames = Object.keys(bySubCamp);
      const otherSubCamps = _.difference(subCampNames, subCamps);
      console.log(subCampNames, otherSubCamps);

      const counts = _.map(subCamps, x => getSubcampCounts(bySubCamp, x));

      const othersTotals = calculateAgeGroupSum(otherSubCamps.map(x => getSubcampCounts(bySubCamp, x)));
      const ageGroupTotals = calculateAgeGroupSum([othersTotals, ...counts]);
      const html = `<!DOCTYPE html>
      <html lang="fi">
      <head>
      <title>Paikalla</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css" integrity="sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B" crossorigin="anonymous">
      </head>
      <body>
      <div>
      <h1>Leirissä tällä hetkellä: ${totalCount}</h1>
      <table class="table">
      <tr>
      <th></th>
      <th>Lapsi</th>
      <th>Sudenpentu</th>
      <th>Seikkailija</th>
      <th>Tarpoja</th>
      <th>Samoaja</th>
      <th>Vaeltaja</th>
      <th>Aikuinen</th>
      <td>yhteensä alaleirissä</td>
      </tr>
      ${_.flatMap(counts, count => [
        '<tr>',
        `<th>${count.subCamp}</th>`,
        `<td>${count.child}</td>`,
        `<td>${count.supe}</td>`,
        `<td>${count.seikkailija}</td>`,
        `<td>${count.tarpoja}</td>`,
        `<td>${count.samoaja}</td>`,
        `<td>${count.vaeltaja}</td>`,
        `<td>${count.adult}</td>`,
        `<td>${count.total}</td>`,
        '</tr>',
      ]).join('\n')
      }
      <tr>
      <th>Muut</th>
      <td>${othersTotals.child}</td>
      <td>${othersTotals.supe}</td>
      <td>${othersTotals.seikkailija}</td>
      <td>${othersTotals.tarpoja}</td>
      <td>${othersTotals.samoaja}</td>
      <td>${othersTotals.vaeltaja}</td>
      <td>${othersTotals.adult}</td>
      <td>${othersTotals.total}</td>
      </tr>
      <tr>
      <td>yhteensä ikäryhmää</td>
      <td>${ageGroupTotals.child}</td>
      <td>${ageGroupTotals.supe}</td>
      <td>${ageGroupTotals.seikkailija}</td>
      <td>${ageGroupTotals.tarpoja}</td>
      <td>${ageGroupTotals.samoaja}</td>
      <td>${ageGroupTotals.vaeltaja}</td>
      <td>${ageGroupTotals.adult}</td>
      <td></td>
      </tr>
      </table>
      <p>Väliaikaisesti poissa: ${temporarilyAway}</p>
      </div>
      </body>
      </html>`;
      res.type('text/html');

      res.send(html);
    } catch (e) {
      next(e);
    }
  });
}

function getSubcampCounts(bySubCamp, subCamp) {
  const subCampRows = bySubCamp[subCamp];

  function getAgeGroup(ageGroup) {
    const ageGroupObj = _.find(subCampRows, x => x.ageGroup === ageGroup) || {};
    return Number(ageGroupObj.count) || 0;
  }

  const child = getAgeGroup('Lapsi 0-2v') + getAgeGroup('Lapsi 3-7v');
  const supe = getAgeGroup('Sudenpentu 7-9v');
  const seikkailija = getAgeGroup('Seikkailija 10-12v');
  const tarpoja = getAgeGroup('Tarpoja 12-15v');
  const samoaja = getAgeGroup('Samoaja 15-17v');
  const vaeltaja = getAgeGroup('Vaeltaja 18-22v');
  const adult = getAgeGroup('Aikuinen');
  const total = child + supe + seikkailija + tarpoja + samoaja + vaeltaja + adult;

  return {
    subCamp,
    child,
    supe,
    seikkailija,
    tarpoja,
    samoaja,
    vaeltaja,
    adult,
    total,
  };
}

function calculateAgeGroupSum(counts) {
  return counts.reduce((acc, elem) => ({
    child: acc.child + elem.child,
    supe: acc.supe + elem.supe,
    seikkailija: acc.seikkailija + elem.seikkailija,
    tarpoja: acc.tarpoja + elem.tarpoja,
    samoaja: acc.samoaja + elem.samoaja,
    vaeltaja: acc.vaeltaja + elem.vaeltaja,
    adult: acc.adult + elem.adult,
    total: acc.total + elem.total,
  }), {
    child: 0,
    supe: 0,
    seikkailija: 0,
    tarpoja: 0,
    samoaja: 0,
    vaeltaja: 0,
    adult: 0,
    total: 0,
  });
}
