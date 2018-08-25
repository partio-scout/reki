import { _ } from 'lodash';
import config from '../conf';

export default function(app){

  app.get('/api/participants/:id', app.wrap(async (req, res) => {
    const id = Number(req.params.id) || 0;

    const customFieldMappers = config.getParticipantCustomFields().map(customFieldName => `kuksa_data->>'${customFieldName}' as "${customFieldName}",`).join('\n');

    const { rows } = await app.locals.pool.query(`WITH presence AS (
      SELECT DISTINCT ON (participant)
        participant,
        presence
      FROM participant_presence
      WHERE participant = $1
      ORDER BY participant, timestamp DESC
    ),
    presence_history AS (
      SELECT
        participant,
        json_agg(json_build_object('timestamp', timestamp, 'presence', presence, 'note', note)) as history
      FROM participant_presence
      WHERE participant = $1
      GROUP BY participant
    ),
    dates AS (
      SELECT
        participant,
        json_agg(date) as dates
      FROM participant_date
      WHERE participant = $1
      GROUP BY participant
    ),
    allergies AS (
      SELECT
        participant_allergy.participant_id,
        json_agg(allergy.name) as allergies
      FROM participant_allergy, allergy
      WHERE participant_allergy.allergy_id = allergy.allergy_id
        AND participant_allergy.participant_id = $1
      GROUP BY participant_allergy.participant_id
    ),
    notes AS (
      SELECT
        participant,
        json_agg(json_build_object('timestamp', timestamp, 'content', content, 'archived', archived)) as notes
      FROM participant_note
      WHERE participant = $1
      GROUP BY participant
    )
    SELECT
      participant.participant_id as "participantId",
      member_number as "memberNumber",
      first_name as "firstName",
      last_name as "lastName",
      local_group as "localGroup",
      sub_camp as "subCamp",
      village,
      camp_group as "campGroup",
      camp_office_notes as "campOfficeNotes",
      extra_info as "editableInfo",
      ${customFieldMappers}
      COALESCE (presence.presence, 0) as presence,
      COALESCE (dates, '[]'::json) as dates,
      COALESCE (allergies, '[]'::json) as allergies,
      COALESCE (notes, '[]'::json) as notes,
      COALESCE (presence_history.history, '[]'::json) as "presenceHistory"
    FROM participant
    LEFT JOIN presence
      ON participant.participant_id = presence.participant
    LEFT JOIN dates
      ON participant.participant_id = dates.participant
    LEFT JOIN allergies
      ON participant.participant_id = allergies.participant_id
    LEFT JOIN notes
      ON participant.participant_id = notes.participant
    LEFT JOIN presence_history
      ON participant.participant_id = presence_history.participant
    WHERE participant.participant_id = $1`, [id]);

    if (rows.length === 1) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Not found');
    }
  }));

  function isValidOrderParameter(orderParam) {
    return Array.isArray(orderParam)
      && orderParam.length === 2
      && isAllowedSortingField(orderParam[0])
      && ['ASC', 'DESC'].includes(orderParam[1]);
  }

  function isAllowedSortingField(fieldName) {
    return [
      'participantId',
      'memberNumber',
      'firstName',
      'lastName',
      'localGroup',
      'subCamp',
      'village',
      'campGroup',
      'extraInfo',
      ...config.getParticipantCustomFields(),
    ].includes(fieldName);
  }

  function getFreeTextSearchTerms(whereFilter) {
    if (!(whereFilter && whereFilter.textSearch)) {
      return 'true';
    }

    const searchableFields = config.getSearchableFieldNames();
    const words = whereFilter.textSearch.split(/\s+/);
    console.log(searchableFields, words);
    return andAll(
      words.map(word =>
        orAll(searchableFields.map(field => ilike(field, word)))));
  }

  function getDateSearchTerms(whereFilter) {
    if (!(whereFilter && whereFilter.dates && Array.isArray(whereFilter.dates))) {
      return 'true';
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dates = whereFilter.dates.filter(date => dateRegex.test(date));

    if (dates.length === 0) {
      return 'true';
    }

    return `participant_id IN (SELECT participant FROM participant_date WHERE date IN (${dates.map(x => `'${x}'`).join(',')}))`;
  }

  function getOtherSearchTerms(whereFilter) {
    if (!whereFilter) {
      return 'true';
    }

    const specialWhereKeys = ['dates', 'textSearch'];
    const keys = Object.keys(whereFilter).filter(key => !specialWhereKeys.includes(key));

    if (keys.length === 0) {
      return 'true';
    }

    return andAll(keys.map(key => `${mapFieldName(key)} = '${whereFilter[key]}'`));
  }

  function mapFieldName(field) {
    const dbFieldNames = {
      participantId: 'participant_id',
      memberNumber: 'member_number',
      firstName: 'first_name',
      lastName: 'last_name',
      localGroup: 'local_group',
      subCamp: 'sub_camp',
      village: 'village',
      campGroup: 'camp_group',
      extraInfo: 'extra_info',
    };
    const directField = dbFieldNames[field];
    if (directField) {
      return directField;
    }
    return `kuksa_data->>'${field}'`;
  }

  function ilike(field, word) {
    return `"${mapFieldName(field)}" ILIKE '%${word}%'`;
  }

  function andAll(conditions) {
    return `(${conditions.join(' AND ')})`;
  }

  function orAll(conditions) {
    return `(${conditions.join(' OR ')})`;
  }

  app.get('/api/participants', app.wrap(async (req, res) => {
    const filter = JSON.parse(req.query.filter || '{}');
    const limit = Number(filter.limit) || null;
    const offset = Number(filter.skip) || null;
    const order = isValidOrderParameter(filter.order) ? filter.order : ['participantId', 'DESC'];

    const customFieldMappers = config.getParticipantCustomFields().map(customFieldName => `kuksa_data->>'${customFieldName}' as "${customFieldName}",`).join('\n');

    const query = `WITH presence AS (
      SELECT DISTINCT ON (participant)
        participant,
        presence
      FROM participant_presence
      ORDER BY participant, timestamp DESC
    ),
    presence_history AS (
      SELECT
        participant,
        json_agg(json_build_object('timestamp', timestamp, 'presence', presence, 'note', note)) as history
      FROM participant_presence
      GROUP BY participant
    ),
    dates AS (
      SELECT
        participant,
        json_agg(date) as dates
      FROM participant_date
      GROUP BY participant
    ),
    allergies AS (
      SELECT
        participant_allergy.participant_id,
        json_agg(allergy.name) as allergies
      FROM participant_allergy, allergy
      WHERE participant_allergy.allergy_id = allergy.allergy_id
      GROUP BY participant_allergy.participant_id
    ),
    notes AS (
      SELECT
        participant,
        json_agg(json_build_object('timestamp', timestamp, 'content', content, 'archived', archived)) as notes
      FROM participant_note
      GROUP BY participant
    )
    SELECT
      participant.participant_id as "participantId",
      member_number as "memberNumber",
      first_name as "firstName",
      last_name as "lastName",
      local_group as "localGroup",
      sub_camp as "subCamp",
      village,
      camp_group as "campGroup",
      camp_office_notes as "campOfficeNotes",
      extra_info as "editableInfo",
      ${customFieldMappers}
      COALESCE (presence.presence, 0) as presence,
      COALESCE (dates, '[]'::json) as dates,
      COALESCE (notes, '[]'::json) as notes,
      count(*) OVER () as count
    FROM participant
    LEFT JOIN presence
      ON participant.participant_id = presence.participant
    LEFT JOIN dates
      ON participant.participant_id = dates.participant
    LEFT JOIN notes
      ON participant.participant_id = notes.participant
    WHERE ${getFreeTextSearchTerms(filter.where)}
      AND ${getDateSearchTerms(filter.where)}
      AND ${getOtherSearchTerms(filter.where)}
    ORDER BY ("${order[0]}") ${order[1]}
    LIMIT $1
    OFFSET $2`;
    const queryParameters = [limit, offset];
    const { rows } = await app.locals.pool.query(query, queryParameters);

    res.json({
      result: rows.map(row => _.omit(row, ['count'])),
      count: rows.length > 0 ? rows[0].count : 0,
    });
  }));

  app.post('/api/participants/massAssign', app.wrap(async (req, res) => {
    const {
      ids,
      fieldName,
      newValue,
    } = req.body;

    if (!Array.isArray(ids)) {
      const error = new Error('Ids needs to be an array.');
      error.status = 400;
      throw error;
    }

    if (fieldName === 'presence') {
      if (!([0,1,2,3].contains(newValue))) {
        const error = new Error(`${newValue} is not a valid presence value.`);
        error.status = 400;
        throw error;
      }

      await app.locals.pool.query(`INSERT INTO participant_presence (
        participant,
        presence,
        note
      )
      SELECT
        value::integer as participant,
        $1 as presence,
        '' as note
      FROM json_array_elements_text($2)`,
        [newValue, JSON.stringify(ids)]);
      res.sendStatus(200);
    } else if (fieldName === 'editableInfo') {
      await app.locals.pool.query(`UPDATE participant
      SET extra_info = $1
      WHERE participant_id = ANY($2)`,
        [newValue, ids]);
      res.sendStatus(200);
    } else if (fieldName === 'campOfficeNotes') {
      await app.locals.pool.query(`UPDATE participant
      SET camp_office_notes = $1
      WHERE participant_id = ANY($2)`,
        [newValue, ids]);
      res.sendStatus(200);
    } else {
      const error = new Error(`Editing field ${fieldName} is not allowed.`);
      error.status = 400;
      throw error;
    }
  }));
}
