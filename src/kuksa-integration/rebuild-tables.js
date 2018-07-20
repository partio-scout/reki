import sequelize from 'sequelize';
import { models } from '../server/models';
import Promise from 'bluebird';
import { _ } from 'lodash';
import moment from 'moment';
import config from '../server/conf';

const Op = sequelize.Op;

if (require.main === module) {
  main().then(
    () => { console.log('Finished successfully.'); process.exit(0); },
    err => { console.error(`Error: ${err}. Exiting.`); process.exit(1); }
  );
}

function main() {
  return rebuildParticipantsTable
    .then(addDatesToParticipants)
    .then(buildSelectionTable)
    .then(deleteCancelledParticipants)
    .then(buildOptionTable);
}

function getWrappedParticipants() {
  function getExtraInfo(participant, fieldName) {
    const field = _.find(participant.kuksa_participantextrainfos, o => _.get(o, 'kuksa_extrainfofield.name') === fieldName);
    return field ? field.value : null;
  }

  function getAllExtraSelections(participant, fieldName) {
    return participant.kuksa_extraselections
      .filter(o => _.get(o, 'kuksa_extraselectiongroup.name') === fieldName)
      .map(selection => selection.name);
  }

  function getExtraSelection(participant, fieldName) {
    const selection = _.find(participant.kuksa_extraselections, o => _.get(o, 'kuksa_extraselectiongroup.name') === fieldName);
    return selection ? selection.name : null;
  }

  function getPaymentStatus(statuses, type) {
    if (!statuses) {
      return null;
    }
    return statuses[type] || null;
  }

  return models.KuksaParticipant.findAll({
    include: [
      {
        model: models.KuksaLocalGroup,
        include: [ models.KuksaSubCamp ],
      },
      models.KuksaCampGroup,
      models.KuksaSubCamp,
      models.KuksaVillage,
      {
        model: models.KuksaParticipantExtraInfo,
        include: [ models.KuksaExtraInfoField ],
      },
      {
        model: models.KuksaExtraSelection,
        include: models.KuksaExtraSelectionGroup,
      },
      models.KuksaParticipantPaymentStatus,
      models.KuksaPayment,
    ],
  })
  // don't add participants that are cancelled
    .then(participants => _.filter(participants, p => !p.cancelled))
    .then(participants => participants.map(participant => ({
      get: path => _.get(participant, path),
      getPaymentStatus: type => getPaymentStatus(participant.kuksa_participantpaymentstatus, type),
      getExtraInfo: field => getExtraInfo(participant, field),
      getExtraSelection: groupName => getExtraSelection(participant, groupName),
      getAllExtraSelections: groupName => getAllExtraSelections(participant, groupName),
      getPayments: () => participant.kuksa_payments.map(payment => payment.name),
      getRawFields: () => participant,
    })));
}

function rebuildParticipantsTable() {
  console.log('Rebuilding participants table...');

  return getWrappedParticipants()
  .then(wrappedParticipants => wrappedParticipants.map(config.getParticipantBuilderFunction()))
  .then(participants =>
    _.reduce(
      participants,
      (acc, participant) => acc.then(() => models.Participant.upsert(participant)),
      Promise.resolve()
    )
  ).then(() => console.log('Rebuild complete.'));
}

function addDatesToParticipants() {

  const participantDatesMapper = config.getParticipantDatesMapper();

  console.log('Adding dates to participants...');
  return getWrappedParticipants().each(setParticipantDates);

  function setParticipantDates(wrappedParticipant) {
    models.ParticipantDate.destroy( { where: { participantId: wrappedParticipant.get('id') } } )
      .then(() => models.ParticipantDate.bulkCreate(mapPaymentsToDates(wrappedParticipant)));
  }

  function mapPaymentsToDates(wrappedParticipant) {
    const participantId = wrappedParticipant.get('id');

    return _(participantDatesMapper(wrappedParticipant))
      .uniq()
      .sort()
      .map(date => ({
        participantId: participantId,
        date: moment(date).toDate(),
      }))
      .value();
  }
}

function buildSelectionTable() {

  const groupsToCreate = config.getSelectionGroupTitles();

  console.log('Building selections table...');

  return models.Selection.destroy( { where: {} } )
  .then(() => models.Participant.findAll())
  .then(participants => Promise.each(participants, p =>
    models.KuksaParticipantExtraSelection.findAll({
      where: { kuksaParticipantId: p.participantId },
      include: {
        model: models.KuksaExtraSelection,
        include: [ models.KuksaExtraSelectionGroup ],
      },
    })
    .then(participantSelections => _.filter(participantSelections, s => !!(s.kuksa_extraselection && s.kuksa_extraselection.kuksa_extraselectiongroup))) // Apparently some selections don't have a group, so handle only selections with group
    .then(participantSelections => _.filter(participantSelections, s => (_.indexOf(groupsToCreate, s.kuksa_extraselection.kuksa_extraselectiongroup.name) > -1)))
    .then(participantSelections => participantSelections.map(sel => ({
      participantParticipantId: sel.kuksaParticipantId,
      kuksaGroupId: sel.kuksa_extraselection.kuksa_extraselectiongroup.id,
      kuksaSelectionId: sel.kuksa_extraselection.id,
      groupName: sel.kuksa_extraselection.kuksa_extraselectiongroup.name.trim(),
      selectionName: sel.kuksa_extraselection.name,
    })))
    .then(selections => models.Selection.bulkCreate(selections))
    ))
  .then(() => console.log('Selections table built.'));
}

function deleteCancelledParticipants() {
  console.log('Deleting cancelled participants...');
  return models.KuksaParticipant.findAll({ where: { cancelled: true } })
    .then(participants => _.map(participants, 'id'))
    .then(idsToDelete => models.Participant.destroy({ where: { participantId: { [Op.in]: idsToDelete } } }))
    .then(count => console.log(`Deleted ${count} cancelled participants.`));
}

function buildOptionTable() {

  const addFieldValues = ({ field, values }) => Promise.each(values, value => models.Option.create({ property: field, value: value }));
  return models.Option.destroy({ where: {} })
    .then(() => Promise.mapSeries(config.getOptionFieldNames(), getFieldValues))
    .then(items => Promise.each(items, addFieldValues));

  function getFieldValues(field) {
    return models.Participant.aggregate( field, 'DISTINCT', { plain: false } )
      .then(values => ({
        field: field,
        values: _(values).map(obj => obj['DISTINCT']).uniq().reject(_.isNull).value().sort(),
      }));
  }
}
