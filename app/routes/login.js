const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('./../../utils/logger');

const validate = async (req, db) => {
  const { name, pass } = req.body;
  if (Object.entries(req.body).length !== 2
      || (name === undefined && pass === undefined)) {
    return [false, 'Two arguments are needed for this service. '
    + 'Required keys: \'name\', \'pass\''];
  }
  if (name === undefined) return [false, 'Key \'name\' is required for this service'];
  if (pass === undefined) return [false, 'Key \'pass\' is required for this service'];

  try {
    const user = await db.collection('tokens').findOne({ name, pass });
    if (user === null) return [false, 'User exists already!'];
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
