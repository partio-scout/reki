import Sequelize from 'sequelize'

export default function (sequelize: Sequelize.Sequelize) {
  class KuksaCampGroup extends Sequelize.Model {}
  KuksaCampGroup.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_campgroup' },
  )

  class KuksaExtraInfoField extends Sequelize.Model {}
  KuksaExtraInfoField.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_extrainfofield' },
  )

  class KuksaExtraSelection extends Sequelize.Model {}
  KuksaExtraSelection.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_extraselection' },
  )

  class KuksaExtraSelectionGroup extends Sequelize.Model {}
  KuksaExtraSelectionGroup.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_extraselectiongroup' },
  )

  class KuksaLocalGroup extends Sequelize.Model {}
  KuksaLocalGroup.init(
    {
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
    },
    { sequelize, modelName: 'kuksa_localgroup' },
  )

  class KuksaParticipant extends Sequelize.Model {}
  KuksaParticipant.init(
    {
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
    },
    { sequelize, modelName: 'kuksa_participant' },
  )

  class KuksaParticipantExtraInfo extends Sequelize.Model {}
  KuksaParticipantExtraInfo.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_participantextrainfo' },
  )

  class KuksaParticipantExtraSelection extends Sequelize.Model {}
  KuksaParticipantExtraSelection.init(
    {},
    { sequelize, modelName: 'kuksa_participantextraselection' },
  )

  class KuksaParticipantPayment extends Sequelize.Model {}
  KuksaParticipantPayment.init(
    {},
    { sequelize, modelName: 'kuksa_participantpayment' },
  )

  class KuksaParticipantPaymentStatus extends Sequelize.Model {}
  KuksaParticipantPaymentStatus.init(
    {
      billed: Sequelize.DATE,
      paid: Sequelize.DATE,
    },
    { sequelize, modelName: 'kuksa_participantpaymentstatus' },
  )

  class KuksaPayment extends Sequelize.Model {}
  KuksaPayment.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_payment' },
  )

  class KuksaSubCamp extends Sequelize.Model {}
  KuksaSubCamp.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_subcamp' },
  )

  class KuksaVillage extends Sequelize.Model {}
  KuksaVillage.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'kuksa_village' },
  )

  // Relationships

  KuksaExtraSelection.belongsTo(KuksaExtraSelectionGroup)
  KuksaExtraSelection.belongsToMany(KuksaParticipant, {
    through: KuksaParticipantExtraSelection,
  })

  KuksaLocalGroup.belongsTo(KuksaCampGroup)
  KuksaLocalGroup.belongsTo(KuksaSubCamp)

  KuksaParticipant.belongsTo(KuksaLocalGroup)
  KuksaParticipant.belongsTo(KuksaCampGroup)
  KuksaParticipant.belongsTo(KuksaVillage)
  KuksaParticipant.belongsTo(KuksaSubCamp)
  KuksaParticipant.hasMany(KuksaParticipantExtraInfo)
  KuksaParticipant.hasOne(KuksaParticipantPaymentStatus)

  KuksaParticipant.belongsToMany(KuksaExtraSelection, {
    through: KuksaParticipantExtraSelection,
  })
  KuksaParticipantExtraSelection.belongsTo(KuksaExtraSelection)
  KuksaExtraSelection.belongsTo(KuksaExtraSelectionGroup)

  KuksaParticipant.belongsToMany(KuksaPayment, {
    through: KuksaParticipantPayment,
  })
  KuksaPayment.belongsToMany(KuksaParticipant, {
    through: KuksaParticipantPayment,
  })

  KuksaParticipantExtraInfo.belongsTo(KuksaParticipant)
  KuksaParticipantExtraInfo.belongsTo(KuksaExtraInfoField)

  // Exports

  return {
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
  }
}
