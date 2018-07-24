import { _ } from 'lodash';
import { models, sequelize } from '../models';
import Sequelize from 'sequelize';

const subCamps = ['Gloria', 'Triton', 'Ra', 'Cyber'];

export default function(app) {
  app.get('/paikalla', async (req, res, next) => {
    try {
      const totalCount = await models.Participant.count({ where: { presence: 3 } });
      const temporarilyAway = await models.Participant.count({ where: { presence: 2 } });
      const rows = await sequelize.query(`SELECT "subCamp","ageGroup", COUNT(*) FROM participants WHERE presence='3' AND "subCamp" IN ('Triton', 'Gloria', 'Ra', 'Cyber') GROUP BY "subCamp", "ageGroup";`, { type: Sequelize.QueryTypes.SELECT });
      const bySubCamp = _.groupBy(rows, row => row.subCamp);

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
      </tr>
      ${_.flatMap(subCamps, subCamp => {
        const subCampRows = bySubCamp[subCamp];

        function getAgeGroup(ageGroup) {
          const ageGroupObj = _.find(subCampRows, x => x.ageGroup === ageGroup) || {};
          return ageGroupObj.count || 0;
        }

        return [
          '<tr>',
          `<th>${subCamp}</th>`,
          `<td>${getAgeGroup('Lapsi 0-2v') + getAgeGroup('Lapsi 3-7v')}</td>`,
          `<td>${getAgeGroup('Sudenpentu 7-9v')}</td>`,
          `<td>${getAgeGroup('Seikkailija 10-12v')}</td>`,
          `<td>${getAgeGroup('Tarpoja 12-15v')}</td>`,
          `<td>${getAgeGroup('Samoaja 15-17v')}</td>`,
          `<td>${getAgeGroup('Vaeltaja 18-22v')}</td>`,
          `<td>${getAgeGroup('Aikuinen')}</td>`,
          '</tr>',
        ];
      }).join('\n')
      }
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
