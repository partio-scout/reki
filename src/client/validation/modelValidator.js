import _ from 'lodash';

function getModelValidator(schema) {
  return function(model) {
    const errors = _(schema).map(rule => {
      const prop = model[rule.property];
      if (!rule.test(prop)) {
        return rule.message;
      } else {
        return null;
      }
    }).toArray().filter(msg => !!msg).value(); // remove null values
    return errors;
  };
}

export { getModelValidator };
