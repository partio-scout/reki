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
  return buildAllergyTable()
    .then(rebuildParticipantsTable)
    .then(addAllergiesToParticipants)
    .then(addDatesToParticipants)
    .then(buildSelectionTable)
    .then(deleteCancelledParticipants)
    .then(buildOptionTable);
}

function buildAllergyTable() {

  console.log('Rebuilding allergies table...');
  return models.KuksaExtraSelectionGroup.findAll({
    where: {
      name: {
        [Op.in]: config.getAllergyFieldTitles(),
      },
    },
  }).then(selGroups => models.KuksaExtraSelection.findAll({ where: { kuksaExtraselectiongroupId: { [Op.in]: _.map(selGroups, group => group.id) } } }))
    .then(selections => selections.map(selection => ({ name: selection.name, allergyId: selection.id })))
    .then(selections => Promise.each(selections, s => models.Allergy.upsert(s)));
}

function rebuildParticipantsTable() {
  function getExtraInfo(participant, fieldName) {
    const field = _.find(participant.kuksa_participantextrainfos, o => _.get(o, 'kuksa_extrainfofield.name') === fieldName);
    return field ? field.value : null;
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

  console.log('Rebuilding participants table...');

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
    ],
  })
  // don't add participants that are cancelled
  .then(participants => _.filter(participants, p => !p.cancelled))
  .then(participants => participants.map(participant => {
    const wrappedParticipant = {
      get: path => _.get(participant, path),
      getPaymentStatus: type => getPaymentStatus(participant.kuksa_participantpaymentstatus, type),
      getExtraInfo: field => getExtraInfo(participant, field),
      getExtraSelection: groupName => getExtraSelection(participant, groupName),
      getRawFields: () => participant,
    };
    return config.getParticipantBuilderFunction()(wrappedParticipant);
  }))
  .then(participants =>
    _.reduce(
      participants,
      (acc, participant) => acc.then(() => models.Participant.upsert(participant)),
      Promise.resolve()
    )
  ).then(() => console.log('Rebuild complete.'));
}

function addAllergiesToParticipants() {
  function removeOldAndAddNewAllergies(participant, newAllergies) {
    Promise.promisifyAll(participant);
    return models.ParticipantAllergy.destroy( { where: { participantParticipantId: participant.participantId } } )
    .then(() => Promise.each(newAllergies, allergyId => models.ParticipantAllergy.create({
      participantParticipantId: participant.participantId,
      allergyAllergyId: allergyId,
    })));
  }

  function findParticipantsAllergies(participant) {

    return models.Allergy.findAll()
    .then(allergies => _.map(allergies, 'allergyId'))
    .then(allergies => models.KuksaParticipantExtraSelection.findAll({
      where: {
        [Op.and]: [
          { kuksaParticipantId: participant.participantId },
          { kuksaExtraselectionId: { [Op.in]: allergies } },
        ],
      },
    }))
    .then(participantsAllergies => _.map(participantsAllergies, 'kuksaExtraselectionId'));
  }

  console.log('Adding allergies and diets to participants...');

  return models.Participant.findAll({ include: [models.Allergy] })
  .then(participants => Promise.each(participants, participant => findParticipantsAllergies(participant)
    .then(allergies => removeOldAndAddNewAllergies(participant, allergies))))
    .then(() => console.log('Allergies and diets added.'));
}

function addDatesToParticipants() {

  const paymentToDateMappings = config.getPaymentToDatesMappings();

  console.log('Adding dates to participants...');
  return models.KuksaParticipant.findAll({ include: models.KuksaPayment }).each(setParticipantDates);

  function setParticipantDates(kuksaParticipantInstance) {
    const kuksaParticipant = kuksaParticipantInstance.toJSON();
    models.ParticipantDate.destroy( { where: { participantId: kuksaParticipant.id } } )
      .then(() => models.ParticipantDate.bulkCreate(mapPaymentsToDates(kuksaParticipant)));
  }

  function mapPaymentsToDates(kuksaParticipant) {
    return _(kuksaParticipant.kuksa_payments)
      .flatMap(payment => paymentToDateMappings[payment.name])
      .uniq()
      .sort()
      .map(date => ({
        participantId: kuksaParticipant.id,
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
