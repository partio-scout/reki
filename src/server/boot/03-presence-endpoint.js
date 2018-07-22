import { models } from '../models';

export default function(app) {
  app.get('/api/presence', /*app.requirePermission('view participants'),*/ async (req, res) => {
    const result = await models.Participant.all();
    res.type('text/csv');
    res.writeHead(200);
    for (const row of result) {
      res.write(`${row.memberNumber},${row.presence}\n`);
    }
    res.end();
  });
}
