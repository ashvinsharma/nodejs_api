const path = require('path');
const jimp = require('jimp');
const download = require('image-downloader');
const logger = require('./../../utils/logger');
const constants = require('./../../utils/constants');
const authenticate = require('./../../utils/authenticate');

// const validateAndDownload = async (uri) => {
//   let out = [];
//   await request.head(uri, async (err, response) => {
//     if (err) {
//       out = [false, `Some error occurred while downloading the file, please try again! ${err}`];
//       return;
//     }
//     const mime = response.headers['content-type'].split('/');
//     if (mime[0] !== 'image') {
//       out = [false, 'File not image type!'];
//     }
//     logger.info(`content-type: ${mime}`);
//     logger.info(`content-length:, ${response.headers['content-length']} bytes`);
//     const filename = `${Date.now()}.${mime[1]}`;
//     logger.info(`Filename: ${filename}`);
//     try {
//       logger.info('Trying to write the file');
//       const buff = await request(uri);
//       await fs.writeFileSync(`${constants.IMAGE_SRC}/${filename}`, buff, 'binary', err => {
//         logger.error(`Error writing file. ${err}`);
//       });
//     } catch (e) {
//       logger.error(`Error while writing the downloaded file. ${e}`);
//       return [false, e];
//     }
//     out = [true, filename];
//   });
//   return out;
// };

module.exports = (app, db) => {
  app.post('/thumbnail', async (req, res) => {
    const auth = await authenticate(req.body.token, db);
    if (auth[0]) {
      // Validate and then download the image
      let filename;
      try {
        // TODO: remove query string from the url if any.
        const dlResult = await download.image({
          url: req.body.img,
          dest: constants.IMAGE_SRC
        });
        logger.info(`Downloaded filename: ${dlResult.filename}`);
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
    } else {
      const error = {
        error: auth[1],
      };
      res.send(error);
    }
  });
};
