import { Promise } from 'bluebird';
import { _ } from 'lodash';

function waterfall(funcs) {
  return _.reduce(funcs, (previous, func) => previous.then(func), Promise.resolve());
}

export default function transfer(models) {
  const transfers = _.map(models, model => () => transferModel(model));
  return waterfall(transfers);
}

function transferModel(model) {
  const recreate = objects => recreateObjects(model.targetModel, objects);
  const upsert = objects => upsertObjects(model.targetModel, objects);
  const recreateAll = async objects => {
    await model.targetModel.destroy({ where: {} });
    await model.targetModel.bulkCreate(objects);
  }

  return model.getFromSource(model.dateRange)
    .then(transformWith(model.transform))
    .then(items => {
      if (model.joinTable) {
        //LoopBack can't upsert join tables for some reason, let's delete the possible old object first
        return recreate(items);
      } else if (model.dateRange) {
        //If date range is set we can't delete all items first or we would lose the items
        //outside the given date range. Thus we must upsert instead.
        return upsert(items);
      } else {
        return recreateAll(items);
      }
    });
}

function recreateObjects(model, objects) {
  const recreates = _.map(objects, obj => async () => {
    await model.destroy({ where: obj });
    await model.create(obj);
  });
  return waterfall(recreates);
}

function upsertObjects(model, objects) {
  const upserts = _.map(objects, obj => () => model.upsert(obj));
  return waterfall(upserts);
}

function transformWith(fn) {
  return objects => _.map(objects, fn);
}
