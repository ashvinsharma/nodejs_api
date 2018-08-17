const login = require('./login');
const thumbnail = require('./thumbnail');

module.exports = (app, db) => {
  login(app, db);
  thumbnail(app, db);
  // Other route groups could go here, in the future
};
