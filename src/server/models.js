import Sequelize from 'sequelize';

const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
const db = new Sequelize(dbUrl, {
  logging: false,
});

const KuksaCampGroup = db.define('kuksa_campgroup', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaExtraInfoField = db.define('kuksa_extrainfofield', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaExtraSelection = db.define('kuksa_extraselection', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaExtraSelectionGroup = db.define('kuksa_extraselectiongroup', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaLocalGroup = db.define('kuksa_localgroup', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  scoutOrganization: Sequelize.STRING,
  locality: Sequelize.STRING,
  country: Sequelize.STRING,
  countryCode: Sequelize.STRING,
});

const KuksaParticipant = db.define('kuksa_participant', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  memberNumber: Sequelize.STRING,
  nickname: Sequelize.STRING,
  dateOfBirth: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  phoneNumber: Sequelize.STRING,
  email: Sequelize.STRING,
  representedParty: Sequelize.STRING,
  accommodation: Sequelize.STRING,
  cancelled: Sequelize.BOOLEAN,
  diet: Sequelize.STRING,
});

const KuksaParticipantExtraInfo = db.define('kuksa_participantextrainfo', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  value: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaParticipantExtraSelection = db.define('kuksa_participantextraselection');

const KuksaParticipantPayment = db.define('kuksa_participantpayment');

const KuksaParticipantPaymentStatus = db.define('kuksa_participantpaymentstatus', {
  billed: Sequelize.DATE,
  paid: Sequelize.DATE,
});

const KuksaPayment = db.define('kuksa_payment', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaSubCamp = db.define('kuksa_subcamp', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const KuksaVillage = db.define('kuksa_village', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Relationships

KuksaExtraSelection.belongsTo(KuksaExtraSelectionGroup);
KuksaExtraSelection.belongsToMany(KuksaParticipant, { through: KuksaParticipantExtraSelection });

KuksaLocalGroup.belongsTo(KuksaCampGroup);
KuksaLocalGroup.belongsTo(KuksaSubCamp);

KuksaParticipant.belongsTo(KuksaLocalGroup);
KuksaParticipant.belongsTo(KuksaCampGroup);
KuksaParticipant.belongsTo(KuksaVillage);
KuksaParticipant.belongsTo(KuksaSubCamp);
KuksaParticipant.hasMany(KuksaParticipantExtraInfo);
KuksaParticipant.hasOne(KuksaParticipantPaymentStatus);

KuksaParticipant.belongsToMany(KuksaExtraSelection, { through: KuksaParticipantExtraSelection });
KuksaParticipantExtraSelection.belongsTo(KuksaExtraSelection);
KuksaExtraSelection.belongsTo(KuksaExtraSelectionGroup);

//KuksaParticipant.hasMany(KuksaPayment);

KuksaParticipant.belongsToMany(KuksaPayment, { through: KuksaParticipantPayment });
KuksaPayment.belongsToMany(KuksaParticipant, { through: KuksaParticipantPayment });

KuksaParticipantExtraInfo.belongsTo(KuksaParticipant);
KuksaParticipantExtraInfo.belongsTo(KuksaExtraInfoField);

// Exports

export const sequelize = db;
export const models = {
  KuksaCampGroup: KuksaCampGroup,
  KuksaExtraInfoField: KuksaExtraInfoField,
  KuksaExtraSelection: KuksaExtraSelection,
  KuksaExtraSelectionGroup: KuksaExtraSelectionGroup,
  KuksaLocalGroup: KuksaLocalGroup,
  KuksaParticipant: KuksaParticipant,
  KuksaParticipantExtraInfo: KuksaParticipantExtraInfo,
  KuksaParticipantExtraSelection: KuksaParticipantExtraSelection,
  KuksaParticipantPayment: KuksaParticipantPayment,
  KuksaParticipantPaymentStatus: KuksaParticipantPaymentStatus,
  KuksaPayment: KuksaPayment,
  KuksaSubCamp: KuksaSubCamp,
  KuksaVillage: KuksaVillage,
};
