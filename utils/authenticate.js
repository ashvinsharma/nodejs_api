const logger = require('./logger');

module.exports = async (req, db) => {
  if (req.body.token === undefined) {
    logger.error('Request is missing token');
    return [false, 'Authentication Failed: Missing Token!'];
  }

  const { token } = req.body;
  try {
    const result = await db.collection('tokens')
      .findOne({ token });
    if (result === null) {
      logger.error(`Token: ${token} not found.`);
      return [false, 'Token not found!'];
    }
    if (Object.entries(result).length !== 0) {
      logger.info('Token found!');
      return [true];
    }
  } catch (e) {
    logger.error(`Can't connect to database atm, try again later. ${e}`);
  }
  return [false, 'Can\'t connect to database atm, try again later.'];
};
