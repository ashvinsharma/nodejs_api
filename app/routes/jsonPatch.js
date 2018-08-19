const { applyPatch, applyOperation } = require('fast-json-patch');
const authenticate = require('./../../utils/authenticate');
const logger = require('./../../utils/logger');

/**
 * @param req - the request body from the client
 * @param db - instance of database
 * @desc - validates the user and the request body
 */
const validate = async (req, db) => {
  const auth = await authenticate(req, db);
  const { token, object, patch } = req.body;

  if (!auth[0]) return [false, auth[1]];
  if (Object.entries(req.body).length !== 3
      || token === undefined
      || object === undefined
      || patch === undefined) {
    return [false, 'Three arguments are needed for this service. '
    + 'Required keys: \'token\', \'object\', \'patch\''];
  }
  return [true];
};

/**
 * @param object - JSON Object from the request body sent by the client
 * @param patch - JSON Patch from the request body sent by the client
 * @desc - Applies the patch;
 */
const doPatch = (object, patch) => (Array.isArray(patch)
  ? applyPatch(object, patch).newDocument
  : applyOperation(object, patch).newDocument);

/**
 * @param app - the app instance from server.js
 * @param db - instance of database
 * @desc - Applies JSON Patch on an Object {@link http://jsonpatch.com/}
 */
module.exports = (app, db) => {
  app.post('/json_patch', async (req, res) => {
    const isValid = await validate(req, db);
    if (!isValid[0]) {
      logger.error(`Aborting: Invalid Request. ${isValid[1]}`);
      res.send({ error: isValid[1] });
      return;
    }

    try {
      logger.info('Parsing JSON...');
      const object = JSON.parse(req.body.object);
      const patch = JSON.parse(req.body.patch);
      try {
        logger.info('Applying patch...');
        const result = doPatch(object, patch);
        logger.info('Patch applied successfully!');
        res.send({ result });
      } catch (e) {
        logger.error(`Failed to patch the json object. ${e}`);
        res.send({ error: 'Failed to patch the json object' });
      }
    } catch (e) {
      logger.error(`Error parse JSON. ${e}`);
      res.send({ error: 'Error parsing JSON! Check the format again.' });
    }
  });
};
