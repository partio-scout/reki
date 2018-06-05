import Promise from 'bluebird';
import app from '../../server/server';
import _ from 'lodash';

export default function (Participant) {

  Participant.handleDateSearch = function(args) {

    let where;

    if (args) {
      if (args.where) {
        where = args.where;
      } else if (args.filter && args.filter.where) {
        where = args.filter.where;
      }

      if (!where || _.isEmpty(where) || (!where.dates && !where.and)) {
        return args;
      }

      if (_.isString(where)) {
        where = JSON.parse(where);
      }

      if (where.dates && where.dates.length == 0) {
        delete where.dates;
        return args;
      }

      let dates;

      if (where.and) {
        dates = where.and.filter(filter => filter.dates);
        if (dates && !_.isEmpty(dates)) {
          dates = dates[0].dates;
          where.and = where.and.filter(filter => !filter.dates);
        }
      } else {
        dates = where.dates;
      }

      if (_.isEmpty(dates)) {
        return args;
      }

      const getParticipantIdsForDates = Promise.promisify(app.models.ParticipantDate.find, { context: app.models.ParticipantDate });

      return getParticipantIdsForDates(constructParticipantDateFilters(dates))
      .then( res => _.map(res, 'participantId'))
      .then( ids => constructInternalDateFilter(ids) )
      .then( newWhere => {

        delete where.dates;

        if (where.length > 0) {
          where = { and: [where, newWhere] };
        } else {
          if (where.and) {
            where.and.push(newWhere);
          } else {
            where = newWhere;
          }
        }

        if (args.where) {
          args.where = where;
        } else if (args.filter && args.filter.where) {
          args.filter.where = where;
        }
        return args;
      });
    }

    function constructParticipantDateFilters(dates){
      if (dates.length == 1) {
        return { where: { date: dates[0] } };
      }
      if (dates.length > 1) {
        const or = [];
        dates.map((value, index) => or.push({ date: value }));
        return { where: { or: or } };
      }
      return {};
    }

    function constructInternalDateFilter(participantIds) {
      return { participantId: { inq: participantIds } };
    }
  };

  Participant.handleTextSearch = function(args) {

    if (args) {
      if (args.where && _.isString(args.where)) {
        args.where = JSON.parse(args.where);
      }

      if (args.filter && _.isString(args.filter)) {
        args.filter = JSON.parse(args.filter);
      }

      if (args.where) {
        args.where = constructTextSearchFilters(args.where);
      } else if (args.filter && args.filter.where) {
        args.filter.where = constructTextSearchFilters(args.filter.where);
      }
    }

    return args;

    function constructTextSearchArray(string) {
      const stripRegex = function(s) {
        // Remove all charactes except alphabets (with umlauts and accents), numbers, dash and hashtag
        return s.replace(/[^A-zÀ-úÀ-ÿ0-9-#]/ig, '');
      };

      function nameQuery(string, string2) {
        const array = new Array();
        array.push({ firstName: { regexp: `/${stripRegex(string)}/i` } });
        array.push({ lastName: { regexp: `/${stripRegex(string2)}/i` } });
        return array;
      }

      const or = nameQuery(string, string);

      if (_.isInteger(parseInt(string))) {
        or.push({ memberNumber: parseInt(string) });
      }

      or.push({ staffPosition: { regexp: `/${stripRegex(string)}/i` } });
      or.push({ staffPositionInGenerator: { regexp: `/${stripRegex(string)}/i` } });
      or.push({ campOfficeNotes: { regexp: `/${stripRegex(string)}/i` } });
      or.push({ editableInfo: { regexp: `/${stripRegex(string)}/i` } });

      const splitted = string.split(' ', 2);

      if (splitted.length === 2) {
        or.push({ and: nameQuery(splitted[0], splitted[1]) });
        or.push({ and: nameQuery(splitted[1], splitted[0]) });
      }

      return or;
    }

    function constructTextSearchFilters(where) {

      if (_.isString(where)) {
        where = JSON.parse(where);
      }

      // if multiple filters
      if (where['and'] && where['and'].length > 0) {

        where['and'].map((value, index, ar) => {
          if (value.textSearch && value.textSearch.length > 0) {
            const name = {};
            name.or = constructTextSearchArray(value.textSearch);

            where['and'].splice(index,1);
            where['and'].push(name);
          }
        });

      } else if (where.textSearch && where.textSearch.length > 0) {

        const textSearchString = where.textSearch;

        delete where.textSearch;
        where.or = constructTextSearchArray(textSearchString);

      }

      return (where.length > 0 ? JSON.stringify(where) : where);
    }
  };

  Participant.massAssignField = (ids, fieldName, newValue, authorId) => {
    // field name : validation function
    const allowedFields = {
      presence: value => _.includes([ 1, 2, 3 ], +value),
      campOfficeNotes: value => _.isString(value),
      editableInfo: value => _.isString(value),
    };

    const fieldIsValid = (field, value) => allowedFields.hasOwnProperty(field) && allowedFields[field](value);

    if (fieldIsValid(fieldName, newValue)) {
      return Participant.findAll(ids).then(rows => {
        const updates = _.map(rows, async row => {
          if (fieldName === 'presence' && row[fieldName] != newValue) {
            await app.models.PresenceHistory.create({
              participantId: row.id,
              presence: newValue,
              timestamp: new Date(),
              authorId: authorId,
            });
          }
          row[fieldName] = newValue;

          // TODO Test this audit event
          app.models.AuditEvent.createEvent.Participant(authorId, row.id, 'update');

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
}
