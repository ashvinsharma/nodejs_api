const path = require('path');
const jimp = require('jimp');
const download = require('image-downloader');
const logger = require('./../../utils/logger');
const constants = require('./../../utils/constants');
const authenticate = require('./../../utils/authenticate');

module.exports = (app, db) => {
  app.post('/thumbnail', async (req, res) => {
    const auth = await authenticate(req, db);
    if (!auth[0]) {
      res.send({ error: auth[1] });
      return;
    }
    // Validate and then download the image
    let filename;
    try {
      // TODO: remove query string from the url if any.
      const dlResult = await download.image({
        url: req.body.img,
        dest: constants.IMAGE_SRC,
      });
      logger.info(`Downloaded filename: ${dlResult.filename}`);
      // eslint-disable-next-line
      filename = dlResult.filename;
    } catch (e) {
      logger.error('Problem with downloading image');
      res.send({ error: 'Error downloading the image' });
      return;
    }
    // resize the image
    try {
      const image = await jimp.read(`${filename}`);
      logger.info('Image opened for manipulation');
      image.resize(50, 50, jimp.RESIZE_BICUBIC);
      logger.info('Image resized, starting to write the file');
      image.write(`${constants.IMAGE_DEST}/${filename}`);
      logger.info('Image is written successfully');
    } catch (e) {
      logger.error(e);
      res.send({ error: 'Error generating thumbnail' });
      return;
    }
    const image = path.join(req.headers.host, filename)
      .replace(/\\/gi, '/');
    res.send({ image });
  });
};
