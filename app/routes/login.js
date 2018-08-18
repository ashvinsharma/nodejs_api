const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const constants = require('./../../utils/constants');
const logger = require('./../../utils/logger');

const validate = async (req, db) => {
  const { user, pass } = req.body;
  if (Object.entries(req.body).length !== 2
      || (user === undefined && pass === undefined)) {
    return [false, 'Two arguments are needed for this service. '
    + 'Required keys: \'user\', \'pass\''];
  }
  if (user === undefined) return [false, 'Key \'user\' is required for this service'];
  if (pass === undefined) return [false, 'Key \'pass\' is required for this service'];

  try {
    const isUser = await db.collection(constants.COLLECTION_TOKENS).findOne({ user });
    if (isUser !== null) return [false, 'User exists already!'];
  } catch (e) {
    return [false, e];
  }
  return [true];
};

module.exports = (app, db) => {
  app.post('/login', async (req, res) => {
    logger.info('Incoming request to /login...');
    const isValid = await validate(req, db);
    if (!isValid[0]) {
      logger.error(`Aborting: Invalid Request. ${isValid[1]}`);
      res.send({ error: isValid[1] });
      return;
    }
    let response = {
      token: jwt.sign(req.body, process.env.SECRET_KEY),
    };
    const hash = await bcrypt.hash(req.body.pass, 5).catch(logger);
    logger.info('token generated');
    logger.info(`Token ${response.token} is assigned to user ${req.body.name}`);
    const userDetails = {
      user: req.body.user,
      pass: hash,
      token: response.token,
    };
    try {
      logger.info('Attempting to insert the token in the database');
      await db.collection(constants.COLLECTION_TOKENS).insertOne(userDetails);
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
