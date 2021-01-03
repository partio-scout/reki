import Sequelize from 'sequelize'

function getIntegrationModels(sequelize: Sequelize.Sequelize) {
  class KuksaCampGroup extends Sequelize.Model {
    id!: number
    name!: string
  }
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

  class KuksaExtraInfoField extends Sequelize.Model {
    id!: number
    name!: string
  }
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

  class KuksaExtraSelection extends Sequelize.Model {
    id!: number
    name!: string

    kuksa_extraselectiongroup?: KuksaExtraSelectionGroup
  }
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

  class KuksaExtraSelectionGroup extends Sequelize.Model {
    id!: number
    name!: string
  }
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

  class KuksaLocalGroup extends Sequelize.Model {
    id!: string
    name!: string
    scoutOrganization!: string | null
    locality!: string | null
    country!: string | null
    countryCode!: string | null
  }
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

  class KuksaParticipant extends Sequelize.Model {
    id!: string
    firstName!: string
    lastName!: string
    memberNumber!: string | null
    nickname!: string | null
    dateOfBirth!: Date | null
    phoneNumber!: string | null
    email!: string | null
    representedParty!: string | null
    accommodation!: string | null
    cancelled!: boolean | null
    diet!: string | null

    kuksa_participantextrainfos?: KuksaParticipantExtraInfo[]
    kuksa_extraselections?: KuksaExtraSelection[]
    kuksa_participantpaymentstatus?: KuksaParticipantPaymentStatus
    kuksa_payments?: KuksaPayment[]
  }
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
        allowNull: true,
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

  class KuksaParticipantExtraInfo extends Sequelize.Model {
    id!: number
    value!: string

    kuksa_extrainfofield?: KuksaExtraInfoField
    kukksa_participant?: KuksaParticipant
  }
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

  class KuksaParticipantExtraSelection extends Sequelize.Model {
    kuksaParticipantId!: number | null

    kuksa_extraselection?: KuksaExtraSelection
  }
  KuksaParticipantExtraSelection.init(
    {},
    { sequelize, modelName: 'kuksa_participantextraselection' },
  )

  class KuksaParticipantPayment extends Sequelize.Model {}
  KuksaParticipantPayment.init(
    {},
    { sequelize, modelName: 'kuksa_participantpayment' },
  )

  class KuksaParticipantPaymentStatus extends Sequelize.Model {
    billed!: Date | null
    paid!: Date | null
  }
  KuksaParticipantPaymentStatus.init(
    {
      billed: Sequelize.DATE,
      paid: Sequelize.DATE,
    },
    { sequelize, modelName: 'kuksa_participantpaymentstatus' },
  )

  class KuksaPayment extends Sequelize.Model {
    id!: number
    name!: string
  }
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

  class KuksaSubCamp extends Sequelize.Model {
    id!: number
    name!: string
  }
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

  class KuksaVillage extends Sequelize.Model {
    id!: number
    name!: string
  }
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
    KuksaCampGroup,
    KuksaExtraInfoField,
    KuksaExtraSelection,
    KuksaExtraSelectionGroup,
    KuksaLocalGroup,
    KuksaParticipant,
    KuksaParticipantExtraInfo,
    KuksaParticipantExtraSelection,
    KuksaParticipantPayment,
    KuksaParticipantPaymentStatus,
    KuksaPayment,
    KuksaSubCamp,
    KuksaVillage,
  }
}

export default getIntegrationModels

export type IntegrationModels = ReturnType<typeof getIntegrationModels>
