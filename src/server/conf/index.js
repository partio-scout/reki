import path from 'path';

function loadConfig(fileName) {
  const config = require(fileName);

  return {
    getFetchDateRanges: () => config.fetchDateRanges,
  };
}

export default loadConfig(path.resolve(__dirname, '../../../conf/test'));
