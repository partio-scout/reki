import path from 'path';

function loadConfig(fileName) {
  const config = require(fileName);

  return {
    getFetchDateRanges: () => config.fetchDateRanges,
    getPaymentToDatesMappings: () => config.paymentToDatesMappings,
    getOptionFieldNames: () => config.optionFields,
  };
}

export default loadConfig(path.resolve(__dirname, '../../../conf/test'));
