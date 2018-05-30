import sequelize from 'sequelize';
import { models } from '../server/models';
import Promise from 'bluebird';
import { _ } from 'lodash';
import moment from 'moment';
import paymentToDateMappings from '../../conf/payment-date-mappings.json';
import optionFields from '../../conf/option-fields.json';

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
        [Op.in]: [
          'Ruoka-aineallergiat. Roihulla ruoka ei sisällä selleriä, kalaa tai pähkinää. Jos et löydä ruoka-aineallergiaasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.',
          'Erityisruokavalio. Roihulla ruoka on täysin laktoositonta. Jos et löydä erityisruokavaliotasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.',
        ],
      },
    },
  }).then(selGroups => models.KuksaExtraSelection.findAll({ where: { kuksaExtraselectiongroupId: { [Op.in]: _.map(selGroups, group => group.id) } } }))
    .then(selections => selections.map(selection => ({ name: selection.name, allergyId: selection.id })))
    .then(selections => Promise.each(selections, s => models.Allergy.upsert(s)));
}

function rebuildParticipantsTable() {
  function getInfoForField(participant, fieldName) {
    const field = _.find(participant.kuksa_participantextrainfos, o => _.get(o, 'kuksa_extrainfofield.name') === fieldName);
    return field ? field.value : null;
  }

  function getSelectionForGroup(participant, fieldName) {
    const selection = _.find(participant.kuksa_extraselections, o => _.get(o, 'kuksa_extraselectiongroup.name') === fieldName);
    return selection ? selection.name : null;
  }

  function getPaymentStatus(statuses, type) {
    if (!statuses) {
      return null;
    }
    return statuses[type] || null;
  }

  function getSubCamp(participant) {
    if (participant.accommodation === 'Perheleirissä') {
      return 'Riehu';
    }
    return _.get(participant, 'kuksa_subcamp.name') || 'Muu';
  }

  function getAgeGroup(participant) {
    const ageGroup = getSelectionForGroup(participant, 'Osallistun seuraavan ikäkauden ohjelmaan:') || 'Muu';
    if (ageGroup === 'perheleirin ohjelmaan (0-11v.), muistathan merkitä lisätiedot osallistumisesta "vain perheleirin osallistujille" -osuuteen.') {
      return 'perheleiri (0-11v.)';
    } else {
      return ageGroup;
    }
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
  .then(participants => participants.map(participant => ({
    participantId: participant.id,
    firstName: participant.firstName,
    lastName: participant.lastName,
    nickname: participant.nickname,
    memberNumber: participant.memberNumber,
    dateOfBirth: participant.dateOfBirth,
    billedDate: getPaymentStatus(participant.kuksa_participantpaymentstatus, 'billed'),
    paidDate: getPaymentStatus(participant.kuksa_participantpaymentstatus, 'paid'),
    phoneNumber: participant.phoneNumber,
    email: participant.email,
    internationalGuest: !!participant.kuksa_localgroup,
    diet: participant.diet,
    accommodation: participant.accommodation || 'Muu',
    localGroup: participant.representedParty || _.get(participant, 'kuksa_localgroup.name') || 'Muu',
    campGroup: _.get(participant, 'kuksa_campgroup.name') || 'Muu',
    subCamp: getSubCamp(participant),
    village: _.get(participant, 'kuksa_village.name') || 'Muu',
    country: _.get(participant, 'kuksa_localgroup.country') || 'Suomi',
    ageGroup: getAgeGroup(participant),
    // Not a scout if a) no finnish member number 2) not part of international group ("local group")
    nonScout: !participant.memberNumber && !_.get(participant, 'kuksa_localgroup.name'),
    staffPosition: getInfoForField(participant, 'Pesti'),
    staffPositionInGenerator: getInfoForField(participant, 'Pesti kehittimessä'),
    willOfTheWisp: getSelectionForGroup(participant, 'Virvatuli'),
    willOfTheWispWave: getSelectionForGroup(participant, 'Virvatulen aalto'),
    guardianOne: getInfoForField(participant, 'Leirillä olevan lapsen huoltaja (nro 1)'),
    guardianTwo: getInfoForField(participant, 'Leirillä olevan lapsen huoltaja (nro 2)'),
    familyCampProgramInfo: getInfoForField(participant, 'Mikäli vastasit edelliseen kyllä, kerro tässä tarkemmin millaisesta ohjelmasta on kyse'),
    childNaps: getSelectionForGroup(participant, 'Lapsi nukkuu päiväunet'),
  })))
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

  console.log('Adding dates to participants...');
  return models.KuksaParticipant.findAll({ include: models.KuksaPayment }).each(setParticipantDates);

  function setParticipantDates(kuksaParticipantInstance) {
    const kuksaParticipant = kuksaParticipantInstance.toJSON();
    console.log(kuksaParticipant);
    models.ParticipantDate.destroy( { where: { participantId: kuksaParticipant.id } } )

      .then(() => console.log(kuksaParticipant.kuksa_payments),models.ParticipantDate.bulkCreate(mapPaymentsToDates(kuksaParticipant)));
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
  const groupsToCreate = [
    '0-11-vuotias lapsi osallistuu',
    'Lapsi osallistuu päiväkodin toimintaan seuraavina päivinä',
    '\tLapsi osallistuu kouluikäisten ohjelmaan seuraavina päivinä',
    'Lapsen uimataito',
    'Lapsi saa poistua itsenäisesti perheleirin kokoontumispaikalta ohjelman päätyttyä',
    '\tLapsi tarvitsee päiväunien aikaan vaippaa',
  ];

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
      participantId: sel.kuksaParticipantId,
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
    .then(() => Promise.mapSeries(optionFields, getFieldValues))
    .then(items => Promise.each(items, addFieldValues));

  function getFieldValues(field) {
    const filter = { fields: { } };
    filter['fields'][field] = true;
    return models.Participant.aggregate( field, 'DISTINCT', { plain: false } )
      .then(values => ({
        field: field,
        values: _(values).map(obj => obj['DISTINCT']).uniq().reject(_.isNull).value().sort(),
      }));
  }
}
