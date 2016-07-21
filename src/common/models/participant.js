import Promise from 'bluebird';
import app from '../../server/server';
import loopback from 'loopback';
import _ from 'lodash';

export default function (Participant) {

  function handleDateSearch(ctx, participantInstance, next) {

    const args = ctx && ctx.args || null;

    let where;

    if (args) {
      if (args.where) {
        where = args.where;
      } else if (args.filter && args.filter.where) {
        where = args.filter.where;
      }

      if (!where || _.isEmpty(where) || (!where.dates && !where.and)) {
        return next();
      }

      if (_.isString(where)) {
        where = JSON.parse(where);
      }

      if (where.dates && where.dates.length == 0) {
        delete where.dates;
        return next();
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
        return next();
      }

      const getParticipantIdsForDates = Promise.promisify(app.models.ParticipantDate.find, { context: app.models.ParticipantDate });

      getParticipantIdsForDates(constructParticipantDateFilters(dates))
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
        next();
      })
      .catch( err => next(err));
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
  }

  function handleTextSearch(ctx, participantInstance, next) {
    const args = ctx && ctx.args || null;
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

    next();

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
  }

  function checkFullParticipantCount(ctx, participantInstance, next) {
    Promise.try(() => getFilterIfShouldCount())
      .then(filterForCount => {
        if (filterForCount) {
          const countParticipants = Promise.promisify(Participant.count, { context: Participant });
          return countParticipants(filterForCount)
            .then(count => {
              const findResult = ctx.result;
              ctx.result = {
                result: findResult,
                count: count,
              };
            });
        }
      }).asCallback(next);

    function getFilterIfShouldCount() {
      const args = ctx && ctx.args || null;

      if (args && args.filter && _.isString(args.filter)) {
        // This if clause is technically not needed since the textsearch hook does the same but I left it here for robustness, in case the text search is changed
        args.filter = JSON.parse(args.filter);
      }

      return args && args.filter && args.filter.count && args.filter.where || false;
    }
  }

  Participant.afterRemote('create', (ctx, participantInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Participant(userId, participantInstance.participantId, 'add')
    .asCallback(next);
  });

  Participant.beforeRemote('findById', (ctx, participantInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Participant(userId, ctx.req.params.id, 'find')
    .asCallback(next);
  });

  Participant.beforeRemote('prototype.updateAttributes', (ctx, participantInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Participant(userId, ctx.req.params.id, 'update')
    .asCallback(next);
  });

  Participant.beforeRemote('find', handleTextSearch);
  Participant.afterRemote('find', checkFullParticipantCount);

  Participant.beforeRemote('count', handleTextSearch);

  Participant.beforeRemote('find', handleDateSearch);
  Participant.beforeRemote('count', handleDateSearch);

  Participant.observe('before delete', (ctx, next) => {
    const findParticipant = Promise.promisify(app.models.Participant.find, { context: app.models.Participant });
    if (ctx.instance) {
      const userId = loopback.getCurrentContext() ? loopback.getCurrentContext().get('accessToken').userId : 0;
      app.models.AuditEvent.createEvent.Participant(userId, ctx.instance.participantId, 'delete')
      .asCallback(next);
    } else {
      findParticipant({ where: ctx.where, fields: { participantId: true } })
        .each(participant => {
          const userId = (loopback.getCurrentContext() && loopback.getCurrentContext().get('accessToken')) ? loopback.getCurrentContext().get('accessToken').userId : 0;
          return app.models.AuditEvent.createEvent.Participant(userId, participant.participantId, 'delete');
        }).asCallback(next);
    }
  });

  Participant.observe('before save', (ctx, next) => {

    if ( ctx.isNewInstance || !ctx.instance ) {
      return next();
    }

    const userId = loopback.getCurrentContext() ? loopback.getCurrentContext().get('accessToken').userId : 0;

    const findParticipantById = Promise.promisify(Participant.findById, { context: Participant });

    findParticipantById(ctx.instance.participantId)
      .then( currentParticipant => {
        if ( currentParticipant != null && currentParticipant.presence != ctx.instance.presence ) {
          ctx.instance.presenceUpdated = true;
          ctx.instance.presenceUpdateAuthor = userId;
        }
      }).asCallback(next);

  });

  Participant.observe('after save', (ctx, next) => {

    if ( !ctx.instance || !ctx.instance.presenceUpdated ) {
      return next();
    }

    const PresenceHistory = app.models.PresenceHistory;

    const createPresenceHistory = Promise.promisify(PresenceHistory.create, { context: PresenceHistory });

    createPresenceHistory({
      participantId: ctx.instance.participantId,
      presence: ctx.instance.presence,
      timestamp: new Date(),
      authorId: ctx.instance.presenceUpdateAuthor,
    }).asCallback(next);

  });

  Participant.massAssignField = (ids, fieldName, newValue, callback) => {
    // field name : validation function
    const allowedFields = {
      presence: value => _.includes([ 1, 2, 3 ], +value),
      campOfficeNotes: value => _.isString(value),
      editableInfo: value => _.isString(value),
    };

    const fieldIsValid = (field, value) => allowedFields.hasOwnProperty(field) && allowedFields[field](value);

    if (fieldIsValid(fieldName, newValue)) {
      Participant.findByIds(ids).then(rows => {
        const updates = _.map(rows, row => {
          row[fieldName] = newValue;
          return row.save();
        });
        Promise.all(updates).nodeify(callback);
      });
    } else {
      const err = new Error(`Editing ${fieldName} not allowed.`);
      err.status = 400;
      return callback(err);
    }
  };

  Participant.getParticipantInformationForApp = (memberNumber, email, cb) => {
    const findParticipant = Promise.promisify(Participant.findOne, { context: Participant });
    let err;
    let where;

    if (!memberNumber && !email) {
      err = new Error('email or memberNumber is required!');
      err.status = 400;
      return cb(err);
    } else {
      if (memberNumber) {
        where = { memberNumber: memberNumber };
      } else if (email) {
        where = { email: email };
      }
      findParticipant({
        where: where,
        fields: [
          'firstName',
          'lastName',
          'phoneNumber',
          'localGroup',
          'campGroup',
          'subCamp',
          'village',
          'ageGroup',
          'memberNumber',
          'email',
        ],
      }).then(participant => {
        if (!participant) {
          err = new Error('Participant not found');
          err.status = 404;
          throw err;
        } else {
          return participant;
        }
      }).asCallback(cb);
    }

  };

  Participant.participantAmount = (subCamp, cb) => {
    const countParticipants = Promise.promisify(Participant.count, { context: Participant });
    const filter = { presence: 3 };
    if (subCamp) {
      filter.subCamp = subCamp;
    }

    countParticipants(filter).asCallback(cb);
  };

  Participant.remoteMethod('massAssignField',
    {
      http: { path: '/massAssign', verb: 'post' },
      accepts: [
        { arg: 'ids', type: 'array', required: 'true' },
        { arg: 'fieldName', type: 'string', required: 'true' },
        { arg: 'newValue', type: 'string', required: 'true' },
      ],
      returns: { arg: 'result', type: 'string' },
    }
  );

  Participant.remoteMethod('getParticipantInformationForApp',
    {
      http: { path: '/appInformation', verb: 'get' },
      accepts: [
        { arg: 'memberNumber', type: 'string', required: false },
        { arg: 'email', type: 'string', required: false },
      ],
      returns: { type: 'object', root: true },
    }
  );

  Participant.remoteMethod('participantAmount',
    {
      http: { path: '/participantAmount', verb: 'get' },
      accepts: { arg: 'subCamp', type: 'string', required: false },
      returns: { arg: 'result', type: 'string' },
    }
  );
}
