const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('./../../utils/logger');

module.exports = (app, db) => {
  app.post('/login', async (req, res) => {
    logger.info('Incoming request to /login...');
    // TODO: validate the request
    let response = {
      token: jwt.sign(req.body, process.env.SECRET_KEY),
    };
    const hash = await bcrypt.hash(req.body.pass, 5).catch(logger);
    logger.info('token generated');
    logger.info(`Token ${response.token} is assigned to user ${req.body.username}`);
    const userDetails = {
      user: req.body.name,
      pass: hash,
      token: response.token,
    };
    try {
      logger.info('Attempting to insert the token in the database');
      await db.collection('tokens').insertOne(userDetails);
      logger.info('Insertion complete with no problems!');
    } catch (e) {
      logger.error(`Problem encountered while inserting data in the database. ERROR: ${e}`);
      response = {
        error: 'System error',
      };
    }
    res.send(response);
  });
};
