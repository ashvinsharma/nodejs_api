const login = require('./login');
const thumbnail = require('./thumbnail');
const jsonPatch = require('./jsonPatch');

module.exports = (app, db) => {
  login(app, db);
  thumbnail(app, db);
  jsonPatch(app, db);
  // Other route groups could go here, in the future
};
