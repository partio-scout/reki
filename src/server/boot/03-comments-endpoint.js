import { models } from '../models';

export default function(app) {
  app.get('/api/comments', async (req, res, next) => {
    try {
      const result = await models.Participant.all();
      res.type('text/csv');
      res.writeHead(200);
      for (const row of result) {
        res.write(`${row.memberNumber},${escapeCsv(row.campOfficeNotes)},${escapeCsv(row.editableInfo)}\n`);
      }
      res.end();
    } catch (e) {
      console.log(e);
      next(e);
    }
  });
}

function escapeCsv(text) {
  if (!text) { return ''; }
  return text.replace(/\n/g, '¬ ').replace(/,/g, '§');
}
