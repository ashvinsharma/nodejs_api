const login = require('./login');

module.exports = (app, db) => {
  login(app, db);
  // Other route groups could go here, in the future
};
