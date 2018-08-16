const jwt = require('jsonwebtoken');
const logger = require('./../../utils/logger');

module.exports = (app) => {
  app.post('/login', (req, res) => {
    // TODO: validate the request
    logger.info(req.body);
    const token = {
      token: jwt.sign(req.body, process.env.SECRET_KEY),
    };
    logger.info(`Token ${token.token} is assigned to user ${req.body.username}`);
    res.send(token);
  });
};
