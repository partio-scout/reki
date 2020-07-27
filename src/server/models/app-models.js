import Sequelize from 'sequelize'
import _ from 'lodash'
import { Address4, Address6 } from 'ip-address'
import { BigInteger } from 'jsbn'
import conf from '../conf'
import { audit } from '../util/audit'

const Op = Sequelize.Op

export default function (db) {
  const User = db.define('user', {
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
    memberNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    blocked: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    passwordHash: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    },
  })

  User.toClientFormat = function (user, sessionType) {
    const userJson = user.toJSON()
    delete userJson.passwordHash
    delete userJson.createdAt
    delete userJson.updatedAt
    userJson.roles = userJson.roles
      ? userJson.roles.map((role) => role.name)
      : []
    userJson.sessionType = sessionType
    return userJson
  }

  const UserRole = db.define('user_role', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  const UserRoleMapping = db.define('user_role_mapping')

  const Participant = db.define(
    'participant',
    _.reduce(
      conf.getParticipantFields(),
      (acc, field) => {
        acc[field.name] = {
          type: Sequelize[field.dataType.toUpperCase()],
          allowNull: field.nullable || false,
        }
        return acc
      },
      {
        participantId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
      },
    ),
  )

  const PresenceHistory = db.define('presence_history', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    presence: Sequelize.INTEGER,
    timestamp: Sequelize.DATE,
    authorId: Sequelize.INTEGER,
  })

  const Allergy = db.define('allergy', {
    allergyId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

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
  })

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
  })

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
  })

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
  })

  const ParticipantAllergy = db.define('participant_allergy')

  const AuditClientData = db.define(
    'audit_client_data',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ipVersion: {
        // allowed values: "ivp4" and "ipv6"
        type: Sequelize.STRING,
        allowNull: false,
      },
      ipAddress: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          fields: ['ipVersion', 'ipAddress', 'userAgent'],
          unique: true,
        },
      ],
    },
  )

  AuditClientData.prototype.getHumanReadableIpString = function getHumanReadableIpString() {
    const bigInt = new BigInteger(this.ipAddress)
    const addressObject =
      this.ipVersion === 'ipv6'
        ? Address6.fromBigInteger(bigInt)
        : Address4.fromBigInteger(bigInt)

    return addressObject.correctForm()
  }

  const AuditEvent = db.define('audit_event', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    model: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    modelId: {
      type: Sequelize.INTEGER,
    },
    changes: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    meta: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    reason: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    clientDataId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })

  AuditEvent.toClientJSON = function (event) {
    const json = event.toJSON()

    if (event.clientData) {
      json.clientData = event.clientData.toJSON()
      json.clientData.humanReadableIpAddress = event.clientData.getHumanReadableIpString()
    }

    if (event.user) {
      json.user = User.toClientFormat(event.user)
    }

    return json
  }

  User.belongsToMany(UserRole, { as: 'roles', through: UserRoleMapping })
  UserRole.belongsToMany(User, { as: 'users', through: UserRoleMapping })

  Participant.hasMany(PresenceHistory, { as: 'presenceHistory' })
  Participant.belongsToMany(Allergy, { through: ParticipantAllergy })
  Participant.hasMany(ParticipantDate, {
    as: 'dates',
    foreignKey: 'participantId',
    sourceKey: 'participantId',
  })
  // The "datesearch" association is identical with dates, but is needed for searching.
  // If we only has dates, it would be difficult to both filter by dates and return all
  // dates of the participant.
  Participant.hasMany(ParticipantDate, {
    as: 'datesearch',
    foreignKey: 'participantId',
    sourceKey: 'participantId',
  })
  Participant.hasMany(Selection)

  Allergy.belongsToMany(Participant, { through: ParticipantAllergy })

  PresenceHistory.belongsTo(Participant)

  Selection.belongsTo(Participant)

  ParticipantDate.belongsTo(Participant)

  Participant.massAssignField = function (ids, fieldName, newValue, req) {
    // field name : validation function
    const allowedFields = {
      presence: (value) => _.includes([1, 2, 3], +value),
      campOfficeNotes: (value) => _.isString(value),
      editableInfo: (value) => _.isString(value),
    }

    const fieldIsValid = (field, value) =>
      Object.prototype.hasOwnProperty.call(allowedFields, field) &&
      allowedFields[field](value)

    if (fieldIsValid(fieldName, newValue)) {
      return Participant.findAll({
        where: { participantId: { [Op.in]: ids } },
      }).then((rows) => {
        const updates = _.map(rows, async (row) => {
          if (row[fieldName] !== newValue) {
            const diff = {
              [fieldName]: {
                old: row[fieldName],
                new: newValue,
              },
            }

            await Promise.all([
              audit({
                req,
                modelType: 'Participant',
                modelId: row.participantId,
                eventType: 'update',
                changes: diff,
              }),
              fieldName === 'presence'
                ? await PresenceHistory.create({
                    participantParticipantId: row.participantId,
                    presence: newValue,
                    timestamp: new Date(),
                    authorId: req.user.id,
                  })
                : Promise.resolve(),
            ])

            row[fieldName] = newValue
          }

          return await row.save()
        })
        return Promise.all(updates)
      })
    } else {
      const err = new Error(`Editing ${fieldName} not allowed.`)
      err.status = 400
      return Promise.reject(err)
    }
  }

  AuditEvent.belongsTo(AuditClientData, {
    as: 'clientData',
    foreignKey: 'clientDataId',
    targetKey: 'id',
  })

  AuditClientData.hasMany(AuditEvent, {
    as: 'clientData',
    foreignKey: 'clientDataId',
    sourceKey: 'id',
  })

  AuditEvent.belongsTo(User, {
    onDelete: 'CASCADE',
  })

  User.hasMany(AuditEvent, {
    onDelete: 'CASCADE',
  })

  return {
    User: User,
    UserRole: UserRole,
    Option: Option,
    SearchFilter: SearchFilter,
    Participant: Participant,
    PresenceHistory: PresenceHistory,
    Selection: Selection,
    ParticipantDate: ParticipantDate,
    Allergy: Allergy,
    ParticipantAllergy: ParticipantAllergy,
    AuditClientData,
    AuditEvent,
  }
}
