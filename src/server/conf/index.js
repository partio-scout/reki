import path from 'path';

function loadConfig(fileName) {
  const config = require(fileName);

  return {
    getFetchDateRanges: () => config.fetchDateRanges,
    getPaymentToDatesMappings: () => config.paymentToDatesMappings,
    getSelectionGroupTitles: () => config.selectionGroupTitles,
    getOptionFieldNames: () => config.optionFields,
    getAllergyFieldTitles: () => config.allergyFields,
  };
}

export default loadConfig(path.resolve(__dirname, '../../../conf/test'));
