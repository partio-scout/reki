const app = require('./src/server/server'); // eslint-disable-line no-unused-vars
let res = '';
const cb = function(err, result) { if (err) { console.error(err); } else { res = result; console.log(res); } };  // eslint-disable-line no-unused-vars
