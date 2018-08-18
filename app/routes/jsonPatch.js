const jsonpatch = require('fast-json-patch');
const authenticate = require('./../../utils/authenticate');
const logger = require('./../../utils/logger');

const validate = async (req, db) => {
  const auth = await authenticate(req, db);
  const { token, object, patch } = req.body;

  if (!auth[0]) return [false, auth[1]];
  if (Object.entries(req.body).length !== 3
      || (token === undefined
          && object === undefined
          && patch === undefined)) {
    return [false, 'Three arguments are needed for this service. '
    + 'Required keys: \'token\', \'object\', \'patch\''];
  }
  if (token === undefined) return [false, 'Key \'token\' is required for this service'];
  if (object === undefined) return [false, 'Key \'object\' is required for this service'];
  if (patch === undefined) return [false, 'Key \'patch\' is required for this service'];
  return [true];
};

const doPatch = (object, patch) => ((typeof patch === 'object')
  ? jsonpatch.applyPatch(object, patch).newDocument
  : jsonpatch.applyPatch(object, patch).newDocument);

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
