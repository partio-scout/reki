import { Promise } from 'bluebird';
import { _ } from 'lodash';

export default function transfer(models) {
  let p = Promise.resolve();
  _.each(models, model => {
    p = p.then(() => transferModel(model));
  });
  return p;
}

function transferModel(model) {
  const opts = { context: model.targetModel };
  const create = Promise.promisify(model.targetModel.create, opts);
  const destroyExisting = Promise.promisify(model.targetModel.destroyAll, opts);
  return model.getFromSource()
    .then(transformWith(model.transform))
    .then(objects => destroyExisting().then(() => create(objects)));
}

function transformWith(fn) {
  return objects => _.map(objects, fn);
}
