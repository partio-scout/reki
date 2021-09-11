import Sequelize, { Op } from 'sequelize'
import _ from 'lodash'
import { AuditParams, ClientData } from '../util/audit'

type SessionType = 'partioid' | 'password'

type MassAssignValueTypes = {
  presence: 1 | 2 | 3
  campOfficeNotes: string
  editableInfo: string
}
type MassAssignFields = keyof MassAssignValueTypes

function getAppModels(sequelize: Sequelize.Sequelize) {
  class User extends Sequelize.Model {
    id!: number
    firstName!: string
    lastName!: string
    memberNumber!: string
    phoneNumber!: string
    email!: string
    blocked!: boolean
    passwordHash!: string

    roles?: UserRole[]
    setRoles!: Sequelize.BelongsToManySetAssociationsMixin<UserRole, number>
    getRoles!: Sequelize.BelongsToManyGetAssociationsMixin<UserRole>

    static toClientFormat(user: User, sessionType?: SessionType): Express.User {
      const userJson: any = user.toJSON()
      delete userJson.passwordHash
      delete userJson.createdAt
      delete userJson.updatedAt
      userJson.roles = userJson.roles
        ? userJson.roles.map((role: any) => role.name)
        : []
      userJson.sessionType = sessionType
      return userJson
    }
  }
  User.init(
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
    },
    { sequelize, modelName: 'user' },
  )

  class AuditEvent extends Sequelize.Model {
    id!: number
    eventType!: string
    model!: string
    modelId!: number | null
    changes!: Record<string, unknown> | null
    meta!: Record<string, unknown> | null
    timestamp!: Date
    reason!: string
    userId!: number | null
    ipAddress!: string
    userAgent!: string

    user?: User
    createUser!: Sequelize.BelongsToCreateAssociationMixin<User>
    setUser!: Sequelize.BelongsToSetAssociationMixin<User, number>

    static toClientJSON(event: AuditEvent) {
      const json: any = event.toJSON()

      if (event.user) {
        json.user = User.toClientFormat(event.user)
      }

      return json
    }

    static async audit({
      modelId,
      modelType,
      eventType,
      reason = '',
      changes = {},
      meta = {},
      userId,
      ipAddress,
      userAgent,
    }: AuditParams): Promise<void> {
      await AuditEvent.create({
        eventType,
        model: modelType,
        modelId: modelId ?? null,
        changes,
        meta,
        reason,
        userId: userId ?? null,
        ipAddress,
        userAgent,
      })
    }
  }
  AuditEvent.init(
    {
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
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'audit_event' },
  )

  class PresenceHistory extends Sequelize.Model {
    author?: User
  }
  PresenceHistory.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      presence: Sequelize.INTEGER,
      timestamp: Sequelize.DATE,
      authorId: Sequelize.INTEGER,
    },
    { sequelize, modelName: 'presence_history' },
  )

  const participantDirectFields = [
    'participantId',
    'presence',
    'firstName',
    'lastName',
    'memberNumber',
    'phoneNumber',
    'campOfficeNotes',
    'editableInfo',
  ] as const

  class Participant extends Sequelize.Model {
    participantId!: number
    presence!: number
    firstName!: string
    lastName!: string
    memberNumber!: string | null
    phoneNumber!: string | null
    campOfficeNotes!: string
    editableInfo!: string
    extraFields!: Record<string, string>

    presenceHistory?: PresenceHistory[]

    static massAssignField<F extends MassAssignFields>(
      ids: readonly number[],
      fieldName: F,
      newValue: MassAssignValueTypes[F],
      clientData: ClientData,
    ) {
      return Participant.findAll({
        where: { participantId: { [Op.in]: Array.from(ids) } },
      }).then((rows) => {
        const updates = _.map(rows, async (row: any) => {
          if (row[fieldName] !== newValue) {
            const diff = {
              [fieldName]: {
                old: row[fieldName],
                new: newValue,
              },
            }

            await AuditEvent.audit({
              ...clientData,
              modelType: 'Participant',
              modelId: row.participantId,
              eventType: 'update',
              changes: diff,
            })
            if (fieldName === 'presence') {
              await PresenceHistory.create({
                participantParticipantId: row.participantId,
                presence: newValue,
                timestamp: new Date(),
                authorId: clientData.userId,
              })
            }

            row[fieldName] = newValue
          }

          return await row.save()
        })
        return Promise.all(updates)
      })
    }

    static readonly defaultFields: ReadonlySet<
      typeof participantDirectFields[number]
    > = new Set(participantDirectFields)

    static readonly searchableDefaultFieldNames: ReadonlySet<
      typeof participantDirectFields[number]
    > = new Set([
      'firstName',
      'lastName',
      'memberNumber',
      'phoneNumber',
      'campOfficeNotes',
      'editableInfo',
    ])

    static isDefaultField(
      fieldName: string,
    ): fieldName is typeof participantDirectFields[number] {
      return Participant.defaultFields.has(fieldName as any)
    }
    static isSearchableField(
      fieldName: typeof participantDirectFields[number],
    ): boolean {
      return Participant.searchableDefaultFieldNames.has(fieldName)
    }
  }
  const participantModelAttributes: Record<
    typeof participantDirectFields[number] | 'extraFields',
    Sequelize.DataType | Sequelize.ModelAttributeColumnOptions
  > = {
    participantId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    presence: {
      type: Sequelize.INTEGER,
      allowNull: true,
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
      allowNull: true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    campOfficeNotes: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    editableInfo: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    extraFields: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }
  Participant.init(participantModelAttributes, {
    sequelize,
    modelName: 'participant',
  })

  class UserRole extends Sequelize.Model {}
  UserRole.init(
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
    { sequelize, modelName: 'user_role' },
  )

  class UserRoleMapping extends Sequelize.Model {}
  UserRoleMapping.init({}, { sequelize, modelName: 'user_role_mapping' })

  class Allergy extends Sequelize.Model {}
  Allergy.init(
    {
      allergyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'allergy' },
  )

  class ParticipantDate extends Sequelize.Model {
    id!: number
    date!: Date
  }
  ParticipantDate.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: Sequelize.DATE,
        primaryKey: true,
      },
    },
    { sequelize, modelName: 'participant_date' },
  )

  class Selection extends Sequelize.Model {}
  Selection.init(
    {
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
    },
    { sequelize, modelName: 'selection' },
  )

  class Option extends Sequelize.Model {
    id!: number
    property!: string
    value!: string
  }
  Option.init(
    {
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
    },
    { sequelize, modelName: 'option' },
  )

  class SearchFilter extends Sequelize.Model {}
  SearchFilter.init(
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
      filter: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'search_filter' },
  )

  class ParticipantAllergy extends Sequelize.Model {}
  ParticipantAllergy.init({}, { sequelize, modelName: 'participant_allergy' })

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
    onDelete: 'SET NULL',
  })

  User.hasMany(PresenceHistory, {
    as: 'author',
    foreignKey: 'authorId',
    onDelete: 'SET NULL',
  })

  Selection.belongsTo(Participant)

  ParticipantDate.belongsTo(Participant)

  AuditEvent.belongsTo(User, {
    constraints: false,
  })

  User.hasMany(AuditEvent, {
    constraints: false,
  })

  return {
    User,
    UserRole,
    Option,
    SearchFilter,
    Participant,
    PresenceHistory,
    Selection,
    ParticipantDate,
    Allergy,
    ParticipantAllergy,
    AuditEvent,
  }
}

export default getAppModels

export type AppModels = ReturnType<typeof getAppModels>
