const logger = require('./logger');
const constants = require('./constants');

/**
 * @param req - the request body from the client
 * @param db - instance of database
 * @desc - returns true if user is authorized, false with error message otherwise
 */
module.exports = async (req, db) => {
  const { token } = req.body;
  if (token === undefined) {
    logger.error('Request is missing token');
    return [false, 'Authentication Failed: Missing Token!'];
  }

  let errorMessage = '';
  try {
    const result = await db.collection(constants.COLLECTION_TOKENS)
      .findOne({ token });
    if (result === null) {
      throw new Error('Token not found!');
    }
    if (Object.entries(result).length !== 0) {
      logger.info('Token found!');
      return [true];
    }
  } catch (e) {
    errorMessage = e.message;
    logger.error(e.message);
  }
  return [false, errorMessage];
};
