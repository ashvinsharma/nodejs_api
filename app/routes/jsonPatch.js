const jsonpatch = require('fast-json-patch');
const authenticate = require('./../../utils/authenticate');
const logger = require('./../../utils/logger');

const doPatch = (object, patch) => ((typeof patch === 'object')
  ? jsonpatch.applyPatch(object, patch).newDocument
  : jsonpatch.applyPatch(object, patch).newDocument);

module.exports = (app, db) => {
  app.post('/json_patch', async (req, res) => {
    const auth = await authenticate(req, db);
    if (!auth[0]) {
      res.send({ error: auth[1] });
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
