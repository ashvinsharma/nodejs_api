const login = require('./login');

module.exports = (app) => {
  login(app);
  // Other route groups could go here, in the future
};
