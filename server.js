const path = require('path');
require('dotenv')
  .config({ path: path.join(__dirname, '.env') });
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');

const app = express();
const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./public')));

MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }).then(async (database) => {
  logger.info('Attempting to connect database');
  const db = database.db('socialcops');
  logger.info('Connection to database is established!');

  // eslint-disable-next-line
  require('./app/routes')(app, db);

  app.listen(port, () => {
    logger.info(`We are live on ${port}`);
  });
}).catch((e) => {
  logger.error(`Connection to database FAILED! Error: ${e}`);
});
