const path = require('path');
require('dotenv')
  .config({ path: path.join(__dirname, '.env') });
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');

const app = express();
const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
require('./app/routes')(app);

app.listen(port, () => {
  logger.info(`Live on port: ${port}`);
});
