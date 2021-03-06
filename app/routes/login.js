const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const constants = require('./../../utils/constants');
const logger = require('./../../utils/logger');

/**
 * @param req - the request body from the client
 * @param db - instance of database
 * @desc - validates the user and the request body
 */
const validate = async (req, db) => {
  const { user, pass } = req.body;
  if (Object.entries(req.body).length !== 2
      || user === undefined
      || pass === undefined) {
    return [false, 'Two arguments are needed for this service. '
    + 'Required keys: \'user\', \'pass\''];
  }

  try {
    const isUser = await db.collection(constants.COLLECTION_TOKENS).findOne({ user });
    if (isUser !== null) throw new Error('User exists already!');
  } catch (e) {
    return [false, e.message];
  }
  return [true];
};

/**
 * @param app - the app instance from server.js
 * @param db - instance of database
 * @desc - Takes username and password and generates a [JWT]{@link  https://jwt.io/}
 * which is be used to validate some other services.
 */
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
