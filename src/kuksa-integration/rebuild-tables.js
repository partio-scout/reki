import app from '../server/server';
import Promise from 'bluebird';
import { _ } from 'lodash';
import moment from 'moment';
import paymentToDateMappings from '../../conf/payment-date-mappings.json';

const KuksaParticipant = app.models.KuksaParticipant;
const findKuksaParticipants = Promise.promisify(KuksaParticipant.find, { context: KuksaParticipant });

const Participant = app.models.Participant;
const upsertParticipant = Promise.promisify(Participant.upsert, { context: Participant });
const findParticipants = Promise.promisify(Participant.find, { context: Participant });
const destroyAllParticipants = Promise.promisify(Participant.destroyAll, { context: Participant });

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
    .then(deleteCancelledParticipants);
}

function buildAllergyTable() {
  // Get all the possible allergies as Allergy-instances
  const upsertAllergy = Promise.promisify(app.models.Allergy.upsert, { context: app.models.Allergy });
  const findExtraSelectionGroups = Promise.promisify(app.models.KuksaExtraSelectionGroup.find, { context: app.models.KuksaExtraSelectionGroup });
  const findExtraSelections = Promise.promisify(app.models.KuksaExtraSelection.find, { context: app.models.KuksaExtraSelection });

  console.log('Rebuilding allergies table...');

  return findExtraSelectionGroups({ where: { name: { inq: ['Ruoka-aineallergiat. Roihulla ruoka ei sisällä selleriä, kalaa tai pähkinää. Jos et löydä ruoka-aineallergiaasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.', 'Erityisruokavalio. Roihulla ruoka on täysin laktoositonta. Jos et löydä erityisruokavaliotasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.'] } } })
    .then(selGroups => findExtraSelections({ where: { groupId: { inq: _.map(selGroups, group => group.id) } } }))
    .then(selections => selections.map(selection => ({ name: selection.name, allergyId: selection.id })))
    .then(selections => Promise.each(selections, s => upsertAllergy(s)));
}

function rebuildParticipantsTable() {
  function getInfoForField(participant, fieldName) {
    const field = _.find(participant.extraInfos, o => _.get(o, 'field.name') === fieldName);
    return field ? field.value : null;
  }

  function getSelectionForGroup(participant, fieldName) {
    const selection = _.find(participant.extraSelections, o => _.get(o, 'group.name') === fieldName);
    return selection ? selection.name : null;
  }

  function getPaymentStatus(statuses, type) {
    if (!statuses) {
      return null;
    }
    return statuses[type] || null;
  }

  function getSubCamp(participant) {
    if (getSelectionForGroup(participant, 'Osallistun seuraavan ikäkauden ohjelmaan:') === 'perheleirin ohjelmaan (0-11v.), muistathan merkitä lisätiedot osallistumisesta \"vain perheleirin osallistujille\" -osuuteen.') {
      return 'Riehu';
    }
    return _.get(participant, 'subCamp.name') || 'Muu';
  }

  console.log('Rebuilding participants table...');

  return findKuksaParticipants({
    include: [
      { 'localGroup': 'subCamp' },
      'campGroup',
      'subCamp',
      'village',
      { 'extraInfos': 'field' },
      { 'extraSelections': 'group' },
      'paymentStatus',
    ],
  })
  .then(participants => participants.map(participant => participant.toObject()))
  .then(participants => _.filter(participants, p => !p.cancelled)) // don't add participants that are cancelled
  .then(participants => participants.map(participant => ({
    participantId: participant.id,
    firstName: participant.firstName,
    lastName: participant.lastName,
    memberNumber: participant.memberNumber,
    dateOfBirth: participant.dateOfBirth,
    billedDate: getPaymentStatus(participant.paymentStatus, 'billed'),
    paidDate: getPaymentStatus(participant.paymentStatus, 'paid'),
    phoneNumber: participant.phoneNumber,
    email: participant.email,
    internationalGuest: !!participant.localGroup,
    diet: participant.diet,
    localGroup: participant.representedParty || _.get(participant, 'localGroup.name') || 'Muu',
    campGroup: _.get(participant, 'campGroup.name') || 'Muu',
    subCamp: getSubCamp(participant),
    village: _.get(participant, 'village.name') || 'Muu',
    ageGroup: getSelectionForGroup(participant, 'Osallistun seuraavan ikäkauden ohjelmaan:') || 'Muu',
    // Not a scout if a) no finnish member number 2) not part of international group ("local group")
    nonScout: !participant.memberNumber && !_.get(participant, 'localGroup.name'),
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
      (acc, participant) => acc.then(() => upsertParticipant(participant)),
      Promise.resolve()
    )
  ).then(() => console.log('Rebuild complete.'));
}

function addAllergiesToParticipants() {
  function removeOldAndAddNewAllergies(participant, newAllergies) {
    Promise.promisifyAll(participant);
    return participant.allergies.destroyAll()
    .then(() => Promise.each(newAllergies, a => participant.allergies.add(a)));
  }

  function findParticipantsAllergies(participant) {
    const findAllergies = Promise.promisify(app.models.Allergy.find, { context: app.models.Allergy });
    const findSelections = Promise.promisify(app.models.KuksaParticipantExtraSelection.find, { context: app.models.KuksaParticipantExtraSelection });

    return findAllergies()
    .then(allergies => _.map(allergies, 'allergyId'))
    .then(allergies => findSelections({ where: { and: [{ participantId: participant.participantId }, { selectionId: { inq: allergies } }] } }))
    .then(participantsAllergies => _.map(participantsAllergies, 'selectionId'));
  }

  console.log('Adding allergies and diets to participants...');

  return findParticipants()
  .then(participants => Promise.each(participants, participant => findParticipantsAllergies(participant)
    .then(allergies => removeOldAndAddNewAllergies(participant, allergies))))
    .then(() => console.log('Allergies and diets added.'));
}

function addDatesToParticipants() {
  const ParticipantDate = app.models.ParticipantDate;
  const findKuksaParticipants = Promise.promisify(KuksaParticipant.find, { context: KuksaParticipant });
  const destroyParticipantDates = Promise.promisify(ParticipantDate.destroyAll, { context: ParticipantDate });
  const createParticipantDates = Promise.promisify(ParticipantDate.create, { context: ParticipantDate });

  console.log('Adding dates to participants...');
  return findKuksaParticipants({ include: 'payments' }).each(setParticipantDates);

  function setParticipantDates(kuksaParticipantInstance) {
    const kuksaParticipant = kuksaParticipantInstance.toJSON();
    destroyParticipantDates({ participantId: kuksaParticipant.id })
      .then(() => createParticipantDates(mapPaymentsToDates(kuksaParticipant)));
  }

  function mapPaymentsToDates(kuksaParticipant) {
    return _(kuksaParticipant.payments)
      .flatMap(payment => paymentToDateMappings[payment.name])
      .uniq()
      .map(date => ({
        participantId: kuksaParticipant.id,
        date: moment(date).toDate(),
      }))
      .value();
  }
}

function buildSelectionTable() {
  const Selection = app.models.Selection;
  const destroyAllSelections = Promise.promisify(Selection.destroyAll, { context: Selection });
  const createSelections = Promise.promisify(Selection.create, { context: Selection });
  const findKuksaParticipantExtraSelections = Promise.promisify(app.models.KuksaParticipantExtraSelection.find, { context: app.models.KuksaParticipantExtraSelection });
  const groupsToCreate = [
    '0-11-vuotias lapsi osallistuu',
    'Lapsi osallistuu päiväkodin toimintaan seuraavina päivinä',
    '\tLapsi osallistuu kouluikäisten ohjelmaan seuraavina päivinä',
    'Lapsen uimataito',
    'Lapsi saa poistua itsenäisesti perheleirin kokoontumispaikalta ohjelman päätyttyä',
    '\tLapsi tarvitsee päiväunien aikaan vaippaa',
  ];

  console.log('Building selections table...');

  return destroyAllSelections()
  .then(() => findParticipants())
  .then(participants => Promise.each(participants, p =>
    findKuksaParticipantExtraSelections({ where: { participantId: p.participantId }, include: { selection: 'group' } })
    .then(participantSelections => participantSelections.map(selections => selections.toObject()))
    .then(participantSelections => _.filter(participantSelections, s => (_.indexOf(groupsToCreate, s.selection.group.name) > -1)))
    .then(participantSelections => participantSelections.map(sel => ({
      participantId: sel.participantId,
      kuksaGroupId: sel.selection.group.id,
      kuksaSelectionId: sel.selection.id,
      groupName: sel.selection.group.name.trim(),
      selectionName: sel.selection.name,
    })))
    .then(selections => createSelections(selections))))
  .then(() => console.log('Selections table built.'));
}

function deleteCancelledParticipants() {
  console.log('Deleting cancelled participants...');
  return findKuksaParticipants({ where: { cancelled: true } })
    .then(participants => _.map(participants, 'id'))
    .then(idsToDelete => destroyAllParticipants({ participantId: { inq: idsToDelete } }))
    .then(info => console.log(`Deleted ${info.count} cancelled participants.`));
}
