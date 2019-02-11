import config from '../conf';

const alwaysIncludedFields = [
  'participantId',
  'memberNumber',
  'firstName',
  'lastName',
  'localGroup',
  'subCamp',
  'village',
  'campGroup',
  'editableInfo',
  'campOfficeNotes',
  'presence',
  'dates',
  'notes',
];

export default function(app) {
  app.get('/api/config', app.wrap( async (req, res) => {
    res.json({
      fields: alwaysIncludedFields.concat(config.getParticipantCustomFields()),
      tableFields: config.getParticipantTableFields(),
      detailsPageFields: config.getDetailsPageFields(),
      filters: config.getFilters(),
    });
  }));
}
