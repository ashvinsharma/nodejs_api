const path = require('path');
const jimp = require('jimp');
const fs = require('fs');
const download = require('download');
const request = require('request-promise');
const logger = require('./../../utils/logger');
const constants = require('./../../utils/constants');
const authenticate = require('./../../utils/authenticate');

const validate = async (req, db) => {
  const auth = await authenticate(req, db);
  const { token, img } = req.body;

  if (!auth[0]) return [false, auth[1]];
  if (Object.entries(req.body).length !== 2
      || (token === undefined && img === undefined)) {
    return [false, 'Two arguments are needed for this service. '
    + 'Required keys: \'token\', \'img\''];
  }
  if (token === undefined) return [false, 'Key \'token\' is required for this service'];
  if (img === undefined) return [false, 'Key \'img\' is required for this service'];
  return [true];
};

const downloadImage = async (url) => {
  let file = '';
  try {
    const headers = await request.head(url);
    const type = headers['content-type'].toString().split('/');
    const size = headers['content-length'];
    logger.info(`File is of type ${type} and ${size} bytes large.`);

    // Checking whether or not type of the file should is image
    if (type[0] !== 'image') return [false, 'File type not image'];

    const filename = `${Date.now()}.${type[1]}`;
    file = `${constants.IMAGE_SRC}/${filename}`;
    const buffer = await download(url);
    await fs.writeFileSync(file, buffer);
  } catch (e) {
    return [false, e];
  }
  logger.info(`Image has been downloaded and saved as ${file}`);
  return [true, file];
};

module.exports = (app, db) => {
  app.post('/thumbnail', async (req, res) => {
    const isValid = await validate(req, db);
    if (!isValid[0]) {
      logger.error(`Aborting: Invalid Request. ${isValid[1]}`);
      res.send({ error: isValid[1] });
      return;
    }
    // Validate and then download the image
    let filename;
    try {
      // Removing query string from the url
      const regx = /\?\S*$/;
      const url = req.body.img.toString().split(regx)[0];
      const result = await downloadImage(url);
      if (!result[0]) {
        logger.error(`Error occurred while downloading the file. ${result[1]}`);
        res.send({ error: 'Error while downloading the file. Check the URL of the image' });
        return;
      }
      logger.info(`Downloaded filename: ${result[1]}`);
      // eslint-disable-next-line
      filename = result[1];
    } catch (e) {
      logger.error('Problem with downloading image');
      res.send({ error: e });
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
      res.send({ error: e });
      return;
    }
    const image = path.join(req.headers.host, filename)
      .replace(/\\/gi, '/');
    res.send({ image });
  });
};
