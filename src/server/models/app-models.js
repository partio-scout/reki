import Sequelize from 'sequelize'
import _ from 'lodash'
import conf from '../conf'

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
      allowNull: false,
    },
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })
  AuditEvent.createEvent = {
    Participant: function (userId, instanceId, description) {
      return AuditEvent.create({
        eventType: description,
        model: 'Participant',
        modelId: instanceId,
        userId,
      })
    },
    User: function (userId, instanceId, description) {
      return AuditEvent.create({
        eventType: description,
        model: 'User',
        modelId: instanceId,
        userId,
      })
    },
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

  PresenceHistory.belongsTo(User, {
    as: 'author',
    foreignKey: 'authorId',
  })

  Selection.belongsTo(Participant)

  ParticipantDate.belongsTo(Participant)

  Participant.massAssignField = function (ids, fieldName, newValue, authorId) {
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
          const createPresenceHistory =
            fieldName === 'presence' && row[fieldName] != newValue
          row[fieldName] = newValue

          await Promise.all([
            AuditEvent.createEvent.Participant(
              authorId,
              row.participantId,
              'update',
            ),
            createPresenceHistory
              ? PresenceHistory.create({
                  participantParticipantId: row.participantId,
                  presence: newValue,
                  timestamp: new Date(),
                  authorId: authorId,
                })
              : Promise.resolve(),
          ])

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
    AuditEvent,
  }
}
