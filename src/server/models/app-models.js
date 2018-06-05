import Sequelize from 'sequelize';
import _ from 'lodash';
import app from '../server';

const Op = Sequelize.Op;

export default function(db) {

  const Participant = db.define('participant', {
    participantId:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    nickname: Sequelize.STRING,
    nonScout:{
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    internationalGuest:{
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    memberNumber: Sequelize.STRING,
    billedDate: Sequelize.DATE,
    paidDate: Sequelize.DATE,
    dateOfBirth:{
      type: Sequelize.DATE,
      allowNull: false,
    },
    phoneNumber: Sequelize.STRING,
    email: Sequelize.STRING,
    homeCity: Sequelize.STRING,
    country: Sequelize.STRING,
    staffPosition: Sequelize.STRING,
    staffPositionInGenerator: Sequelize.STRING,
    swimmingSkill: Sequelize.BOOLEAN,
    gender: Sequelize.BOOLEAN,
    interestedInHomeHospitality: Sequelize.BOOLEAN,
    presence: Sequelize.INTEGER,
    localGroup:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    campGroup:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    village:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    subCamp:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    accommodation: Sequelize.STRING,
    ageGroup:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    willOfTheWisp: Sequelize.STRING,
    willOfTheWispWave: Sequelize.STRING,
    guardianOne: Sequelize.STRING,
    guardianTwo: Sequelize.STRING,
    diet: Sequelize.STRING,
    familyCampProgramInfo: Sequelize.STRING,
    childNaps: Sequelize.STRING,
    campOfficeNotes: Sequelize.STRING,
    editableInfo: Sequelize.STRING,

  }, {
    indexes: [ {
      fields: [
        'firstName',
        'lastName',
        'phoneNumber',
        'presence',
        'localGroup',
        'campGroup',
        'village',
        'subCamp',
        'accommodation',
        'ageGroup',
        'campOfficeNotes',
        'editableInfo',
      ] },
    ],
  });

  const PresenceHistory = db.define('presence_history', {
    presence: Sequelize.INTEGER,
    timestamp: Sequelize.DATE,
    authorId: Sequelize.INTEGER,
  });

  const Allergy = db.define('allergy', {
    allergyId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  const ParticipantDate = db.define('participant_date', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: Sequelize.DATE,
      primaryKey: true,
    },
  });

  const Selection = db.define('selection', {
    selectionId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kuksaGroupId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    kuksaSelectionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    groupName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    selectionName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  const Option = db.define('option', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    property: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  const SearchFilter = db.define('search_filter', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    filter: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  const ParticipantAllergy = db.define('participant_allergy');

  Participant.hasMany(PresenceHistory, { as: 'presenceHistory' });
  Participant.belongsToMany(Allergy, { through: ParticipantAllergy });
  Participant.hasMany(ParticipantDate, { as: 'dates', foreignKey: 'participantId', sourceKey: 'participantId' }); //!!
  Participant.hasMany(Selection);

  Allergy.belongsToMany(Participant, { through: ParticipantAllergy });

  PresenceHistory.belongsTo(Participant);

  Selection.belongsTo(Participant);

  ParticipantDate.belongsTo(Participant);

  Participant.massAssignField = function(ids, fieldName, newValue, authorId) {
    // field name : validation function
    const allowedFields = {
      presence: value => _.includes([ 1, 2, 3 ], +value),
      campOfficeNotes: value => _.isString(value),
      editableInfo: value => _.isString(value),
    };

    const fieldIsValid = (field, value) => allowedFields.hasOwnProperty(field) && allowedFields[field](value);

    if (fieldIsValid(fieldName, newValue)) {
      return Participant.findAll({ where: { 'participantId': { [Op.in]: ids } } }).then(rows => {
        const updates = _.map(rows, async row => {
          if (fieldName === 'presence' && row[fieldName] != newValue) {
            await PresenceHistory.create({
              participantParticipantId: row.participantId,
              presence: newValue,
              timestamp: new Date(),
              authorId: authorId,
            });
          }
          row[fieldName] = newValue;

          // TODO Test this audit event
          await app.models.AuditEvent.createEvent.Participant(authorId, row.participantId, 'update');

          return row.save();
        });
        return Promise.all(updates);
      });
    } else {
      const err = new Error(`Editing ${fieldName} not allowed.`);
      err.status = 400;
      return Promise.reject(err);
    }
  };

  return {
    Option: Option,
    SearchFilter: SearchFilter,
    Participant: Participant,
    PresenceHistory: PresenceHistory,
    Selection: Selection,
    ParticipantDate: ParticipantDate,
    Allergy: Allergy,
    ParticipantAllergy: ParticipantAllergy,
  };
}
