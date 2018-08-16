const { createLogger, format, transports } = require('winston');

const {
  combine, colorize, timestamp, printf,
} = format;

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    printf(info => `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`),
  ),
  transports: [
    new (transports.Console)({
      colorize: true,
    }),
  ],
});

module.exports = logger;
