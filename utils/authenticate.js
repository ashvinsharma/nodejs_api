const logger = require('./logger');

module.exports = async (token, db) => {
  try {
    const result = await db.collection('tokens')
                           .findOne({ 'token': token });
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
    return [false, 'Can\'t connect to database atm, try again later.'];
  }
};
