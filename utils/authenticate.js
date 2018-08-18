const logger = require('./logger');

module.exports = async (req, db) => {
  const { token } = req.body;
  if (token === undefined) {
    logger.error('Request is missing token');
    return [false, 'Authentication Failed: Missing Token!'];
  }

  try {
    const result = await db.collection(constants.COLLECTION_TOKENS)
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
